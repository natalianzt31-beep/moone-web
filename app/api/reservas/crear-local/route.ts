import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";

/**
 * Alquiler: la clienta elige "pagar en el local" en vez de Mercado Pago.
 * A diferencia del flujo con MP (donde la reserva recién se crea cuando el
 * webhook confirma el pago), acá la reserva se crea de inmediato para
 * bloquear las fechas, pero con senia_confirmada:false y sin fila en
 * `payments` — queda pendiente de que la vendedora confirme el pago recibido
 * (efectivo/transferencia/POS) desde el backoffice.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  let body: { productId?: string; fechaRetiro?: string; fechaDevolucion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { productId, fechaRetiro, fechaDevolucion } = body;
  if (!productId || !fechaRetiro || !fechaDevolucion) {
    return NextResponse.json(
      { error: "Faltan productId, fechaRetiro o fechaDevolucion." },
      { status: 400 }
    );
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
    .select("id, precio_alquiler")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "No encontramos esa prenda." }, { status: 404 });
  }

  const precioTotal = product.precio_alquiler;
  const senia = Math.round(precioTotal * 0.5);

  const { error: reservaError } = await supabase.from("reservations").insert({
    product_id: productId,
    client_id: client.id,
    fecha_retiro: fechaRetiro,
    fecha_devolucion: fechaDevolucion,
    precio_total: precioTotal,
    senia,
    senia_confirmada: false,
    medio_pago: null,
  });

  if (reservaError) {
    return NextResponse.json(
      {
        error:
          reservaError.code === "23P01"
            ? "Esa prenda ya tiene una reserva que se superpone con esas fechas."
            : reservaError.message,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
