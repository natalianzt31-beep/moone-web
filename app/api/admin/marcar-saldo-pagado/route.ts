import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { facturarYEnviar } from "@/lib/facturacion";

/**
 * Marca el saldo de un alquiler como pagado (al retirar la prenda) y, recién
 * en ese momento, emite el e-ticket por el total del alquiler y lo manda por
 * mail — Môone factura solo al final, no en la seña.
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

  let body: { reservationId?: string; medioPago?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { reservationId, medioPago } = body;
  if (!reservationId) {
    return NextResponse.json({ error: "Falta reservationId." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: reserva, error: reservaError } = await supabase
    .from("reservations")
    .select(
      "id, precio_total, saldo_pagado, eticket_generado, medio_pago, products(sku, nombre), clients(nombre, email, documento)"
    )
    .eq("id", reservationId)
    .single();

  if (reservaError || !reserva) {
    return NextResponse.json({ error: "No encontramos esa reserva." }, { status: 404 });
  }

  if (reserva.saldo_pagado) {
    return NextResponse.json({ error: "El saldo ya estaba marcado como pagado." }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update({
      saldo_pagado: true,
      saldo_pagado_fecha: new Date().toISOString(),
      medio_pago: medioPago ?? reserva.medio_pago,
    })
    .eq("id", reservationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const producto = Array.isArray(reserva.products) ? reserva.products[0] : reserva.products;
  const cliente = Array.isArray(reserva.clients) ? reserva.clients[0] : reserva.clients;

  const resultado = await facturarYEnviar({
    cliente: { nombre: cliente?.nombre ?? "Clienta", documento: cliente?.documento ?? null },
    clienteEmail: cliente?.email ?? null,
    medioPago: medioPago ?? reserva.medio_pago ?? "efectivo",
    codigoProducto: producto?.sku ?? "ALQUILER",
    descripcion: `Alquiler — ${producto?.nombre ?? "prenda"}`,
    total: reserva.precio_total,
  });

  await supabase
    .from("reservations")
    .update({
      eticket_generado: resultado.eticket_generado,
      eticket_url: resultado.eticket_url,
      eticket_numero: resultado.eticket_numero,
    })
    .eq("id", reservationId);

  return NextResponse.json({ ok: true, facturacion: resultado });
}
