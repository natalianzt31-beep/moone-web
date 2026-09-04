import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { facturarYEnviar } from "@/lib/facturacion";

/**
 * La vendedora confirma desde el backoffice un pago de venta cargado como
 * "pagar en el local". Al confirmarlo se completa la venta (la prenda pasa a
 * baja_definitiva) y se emite/envía el e-ticket, ya que en una venta el pago
 * es del 100% y por lo tanto ya es "el final" de la operación.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  const userSupabase = getSupabaseUserClient(accessToken);
  const { data: esStaff } = await userSupabase.rpc("is_staff");
  if (!esStaff) {
    return NextResponse.json({ error: "No autorizada." }, { status: 403 });
  }

  let body: { paymentId?: string; medioPago?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { paymentId, medioPago } = body;
  if (!paymentId || !medioPago) {
    return NextResponse.json({ error: "Faltan paymentId o medioPago." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(
      "id, confirmado, tipo, monto, product_id, products(sku, nombre, estado), client_id, clients(nombre, email, documento)"
    )
    .eq("id", paymentId)
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ error: "No encontramos ese pago." }, { status: 404 });
  }

  if (payment.tipo !== "venta") {
    return NextResponse.json({ error: "Ese pago no es de una venta." }, { status: 400 });
  }

  if (payment.confirmado) {
    return NextResponse.json({ error: "Ese pago ya estaba confirmado." }, { status: 409 });
  }

  const producto = Array.isArray(payment.products) ? payment.products[0] : payment.products;
  const cliente = Array.isArray(payment.clients) ? payment.clients[0] : payment.clients;

  const { data: vendida, error: updateProductError } = await supabase
    .from("products")
    .update({ estado: "baja_definitiva" })
    .eq("id", payment.product_id)
    .eq("estado", "reservado")
    .select("id");

  if (updateProductError || !vendida || vendida.length === 0) {
    return NextResponse.json(
      { error: "La prenda ya no estaba reservada para esta venta (revisar manualmente)." },
      { status: 409 }
    );
  }

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update({ confirmado: true, medio: medioPago })
    .eq("id", paymentId);

  if (updatePaymentError) {
    return NextResponse.json({ error: updatePaymentError.message }, { status: 500 });
  }

  const resultado = await facturarYEnviar({
    cliente: { nombre: cliente?.nombre ?? "Clienta", documento: cliente?.documento ?? null },
    clienteEmail: cliente?.email ?? null,
    medioPago,
    codigoProducto: producto?.sku ?? "VENTA",
    descripcion: `Venta — ${producto?.nombre ?? "prenda"}`,
    total: payment.monto,
  });

  await supabase
    .from("payments")
    .update({
      eticket_generado: resultado.eticket_generado,
      eticket_url: resultado.eticket_url,
      eticket_numero: resultado.eticket_numero,
    })
    .eq("id", paymentId);

  return NextResponse.json({ ok: true, facturacion: resultado });
}
