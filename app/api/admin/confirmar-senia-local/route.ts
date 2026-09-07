import { NextResponse } from "next/server";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { enviarConfirmacionReserva } from "@/lib/email/reservas";

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
    .select(
      "id, senia, senia_confirmada, precio_total, fecha_retiro, fecha_devolucion, products(nombre), clients(nombre, email)"
    )
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

  const producto = Array.isArray(reserva.products) ? reserva.products[0] : reserva.products;
  const cliente = Array.isArray(reserva.clients) ? reserva.clients[0] : reserva.clients;

  if (cliente?.email) {
    const resultado = await enviarConfirmacionReserva({
      reservationId,
      clienteEmail: cliente.email,
      clienteNombre: cliente.nombre ?? "Clienta",
      productoNombre: producto?.nombre ?? "prenda",
      fechaRetiro: reserva.fecha_retiro,
      fechaDevolucion: reserva.fecha_devolucion,
      seniaPagada: reserva.senia,
      saldoPendiente: reserva.precio_total - reserva.senia,
    });
    await supabase
      .from("reservations")
      .update({
        senia_avisada: resultado.ok,
        senia_avisada_fecha: resultado.ok ? new Date().toISOString() : null,
      })
      .eq("id", reservationId);
  }

  return NextResponse.json({ ok: true });
}
