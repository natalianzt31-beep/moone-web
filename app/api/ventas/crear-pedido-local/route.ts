import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";

/**
 * Venta: la clienta elige "pagar en el local" en vez de Mercado Pago.
 * Se marca la prenda como reservada (para que no la compre otra persona
 * mientras tanto) y se carga un pago pendiente (confirmado:false) — la
 * vendedora lo confirma desde el backoffice cuando recibe el pago, momento
 * en el que la prenda pasa a baja_definitiva.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { productId } = body;
  if (!productId) {
    return NextResponse.json({ error: "Falta productId." }, { status: 400 });
  }

  const userSupabase = getSupabaseUserClient(accessToken);

  const {
    data: { user },
    error: userError,
  } = await userSupabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { data: client, error: clientError } = await userSupabase
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "No encontramos tu cuenta de clienta." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, precio_venta, estado")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "No encontramos esa prenda." }, { status: 404 });
  }

  if (product.estado !== "disponible" || product.precio_venta == null) {
    return NextResponse.json({ error: "Esta prenda ya no está disponible." }, { status: 409 });
  }

  // Reserva la prenda antes de cargar el pago pendiente: evita que otra
  // clienta la compre por Mercado Pago mientras se coordina el pago local.
  const { data: reservada, error: updateError } = await supabase
    .from("products")
    .update({ estado: "reservado" })
    .eq("id", productId)
    .eq("estado", "disponible")
    .select("id");

  if (updateError || !reservada || reservada.length === 0) {
    return NextResponse.json({ error: "Esta prenda ya no está disponible." }, { status: 409 });
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    product_id: productId,
    client_id: client.id,
    tipo: "venta",
    medio: "pendiente",
    monto: product.precio_venta,
    confirmado: false,
  });

  if (paymentError) {
    // Revertir el hold si no se pudo cargar el pago pendiente.
    await supabase.from("products").update({ estado: "disponible" }).eq("id", productId);
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
