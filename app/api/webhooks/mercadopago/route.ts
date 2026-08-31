import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export async function POST(req: Request) {
  const url = new URL(req.url);
  let type: string | null = url.searchParams.get("type") ?? url.searchParams.get("topic");
  let paymentId: string | null = null;

  try {
    const body = await req.json();
    type = body?.type ?? (body?.action ? String(body.action).split(".")[0] : null) ?? type;
    paymentId = body?.data?.id ? String(body.data.id) : null;
  } catch {
    // Mercado Pago también puede notificar por query params, sin body JSON.
  }

  if (!paymentId) {
    paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  }

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const payment = await new Payment(getMercadoPagoConfig()).get({ id: paymentId });

    if (payment.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseServiceClient();

    // Idempotencia: Mercado Pago puede reenviar la misma notificación varias
    // veces. Si ya procesamos este pago, no volvemos a crear nada.
    const { data: pagoExistente } = await supabase
      .from("payments")
      .select("id")
      .eq("mp_payment_id", String(payment.id))
      .maybeSingle();

    if (pagoExistente) {
      return NextResponse.json({ received: true });
    }

    const metadata = (payment.metadata ?? {}) as Record<string, unknown>;
    const productId = metadata.product_id as string | undefined;
    const clientId = metadata.client_id as string | undefined;
    const fechaRetiro = metadata.fecha_retiro as string | undefined;
    const fechaDevolucion = metadata.fecha_devolucion as string | undefined;
    const precioTotal = Number(metadata.precio_total ?? 0);
    const senia = Number(metadata.senia ?? payment.transaction_amount ?? 0);

    if (!productId || !clientId || !fechaRetiro || !fechaDevolucion) {
      console.error("Webhook de Mercado Pago aprobado sin metadata completa", {
        paymentId: payment.id,
        metadata,
      });
      return NextResponse.json({ received: true });
    }

    // La reserva recién se crea acá, con el pago ya aprobado. Si alguien
    // abandona el pago a mitad de camino, nunca llega a este punto y no
    // queda ninguna reserva fantasma bloqueando el producto.
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
        product_id: productId,
        client_id: clientId,
        fecha_retiro: fechaRetiro,
        fecha_devolucion: fechaDevolucion,
        estado: "reservado",
        precio_total: precioTotal,
        senia,
        senia_confirmada: true,
        medio_pago: "mercado_pago",
      })
      .select("id")
      .single();

    if (reservationError || !reservation) {
      // El pago ya está aprobado (Mercado Pago ya le cobró a la clienta) pero
      // no pudimos crear la reserva (ej. esas fechas se ocuparon mientras
      // pagaba). Requiere revisión manual: no hay forma automática segura de
      // reembolsar ni reasignar desde acá.
      console.error(
        "Pago de Mercado Pago aprobado pero no se pudo crear la reserva — revisar manualmente",
        reservationError,
        { paymentId: payment.id, productId, clientId, fechaRetiro, fechaDevolucion, senia }
      );
      return NextResponse.json({ received: true });
    }

    const { error: insertPaymentError } = await supabase.from("payments").insert({
      reservation_id: reservation.id,
      medio: "mercado_pago",
      tipo: "seña",
      monto: payment.transaction_amount ?? senia,
      mp_payment_id: String(payment.id),
    });

    if (insertPaymentError) {
      console.error("No se pudo registrar el pago", insertPaymentError);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err);
    return NextResponse.json({ error: "Error procesando el pago" }, { status: 500 });
  }
}
