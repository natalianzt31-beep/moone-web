import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";

/**
 * La vendedora confirma desde el backoffice que recibió el pago de la seña
 * (efectivo/transferencia/POS) de una reserva cargada como "pagar en el
 * local". No factura acá — Môone factura recién al final del alquiler,
 * cuando se marca el saldo como pagado (ver /api/admin/marcar-saldo-pagado).
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
  if (!reservationId || !medioPago) {
    return NextResponse.json({ error: "Faltan reservationId o medioPago." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: reserva, error: reservaError } = await supabase
    .from("reservations")
    .select("id, senia, senia_confirmada")
    .eq("id", reservationId)
    .single();

  if (reservaError || !reserva) {
    return NextResponse.json({ error: "No encontramos esa reserva." }, { status: 404 });
  }

  if (reserva.senia_confirmada) {
    return NextResponse.json({ error: "La seña ya estaba confirmada." }, { status: 409 });
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    reservation_id: reservationId,
    tipo: "seña",
    medio: medioPago,
    monto: reserva.senia,
  });

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update({ senia_confirmada: true, medio_pago: medioPago })
    .eq("id", reservationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
