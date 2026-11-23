import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { enviarMailConfirmacionReserva } from "@/lib/email/reservas";

/**
 * Dispara el mail "¡Tu reserva está confirmada!" apenas una vendedora carga
 * una reserva a mano desde /admin/reservas (CargarReservaForm). Antes de
 * esto, una reserva cargada por ese camino nunca mandaba mail — solo las
 * creadas por el checkout online o por "pagar en el local" lo hacían.
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

  let body: { reservationId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { reservationId } = body;
  if (!reservationId) {
    return NextResponse.json({ error: "Falta reservationId." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: reserva, error: reservaError } = await supabase
    .from("reservations")
    .select("pedido_id")
    .eq("id", reservationId)
    .single();

  if (reservaError || !reserva?.pedido_id) {
    return NextResponse.json({ error: "No encontramos esa reserva." }, { status: 404 });
  }

  const resultado = await enviarMailConfirmacionReserva(reserva.pedido_id);
  if (!resultado.ok) {
    return NextResponse.json({ ok: false, reason: resultado.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
