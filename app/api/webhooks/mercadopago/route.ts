import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import type { SupabaseClient } from "@supabase/supabase-js";

async function procesarPagoAlquiler(
  supabase: SupabaseClient,
  payment: { id?: string | number; transaction_amount?: number },
  metadata: Record<string, unknown>
) {
  const productId = metadata.product_id as string | undefined;
  const clientId = metadata.client_id as string | undefined;
  const fechaRetiro = metadata.fecha_retiro as string | undefined;
  const fechaDevolucion = metadata.fecha_devolucion as string | undefined;
  const precioTotal = Number(metadata.precio_total ?? 0);
  const senia = Number(metadata.senia ?? payment.transaction_amount ?? 0);

  if (!productId || !clientId || !fechaRetiro || !fechaDevolucion) {
    console.error("Webhook de Mercado Pago (alquiler) aprobado sin metadata completa", {
      paymentId: payment.id,
      metadata,
    });
    return;
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
    return;
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
}

async function procesarPagoVenta(
  supabase: SupabaseClient,
  payment: { id?: string | number; transaction_amount?: number },
  metadata: Record<string, unknown>
) {
  const productId = metadata.product_id as string | undefined;
  const clientId = metadata.client_id as string | undefined;
  const precioVenta = Number(metadata.precio_venta ?? payment.transaction_amount ?? 0);

  if (!productId || !clientId) {
    console.error("Webhook de Mercado Pago (venta) aprobado sin metadata completa", {
      paymentId: payment.id,
      metadata,
    });
    return;
  }

  const { error: insertPaymentError } = await supabase.from("payments").insert({
    product_id: productId,
    client_id: clientId,
    medio: "mercado_pago",
    tipo: "venta",
    monto: payment.transaction_amount ?? precioVenta,
    mp_payment_id: String(payment.id),
  });

  if (insertPaymentError) {
    console.error("No se pudo registrar el pago de venta", insertPaymentError);
  }

  // Solo la marcamos vendida si seguía disponible: si ya no lo estaba,
  // alguien más la vendió mientras esta pagaba — el pago ya está cobrado
  // así que igual queda registrado arriba, pero requiere revisión manual
  // (reembolso o reasignación) porque la prenda física ya no está libre.
  const { data: actualizado, error: updateError } = await supabase
    .from("products")
    .update({ estado: "baja_definitiva" })
    .eq("id", productId)
    .eq("estado", "disponible")
    .select("id");

  if (updateError) {
    console.error("No se pudo marcar la prenda como vendida", updateError);
  } else if (!actualizado || actualizado.length === 0) {
    console.error(
      "Pago de venta aprobado pero la prenda ya no estaba disponible — posible doble venta, revisar manualmente",
      { paymentId: payment.id, productId, clientId }
    );
  }
}

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

    if (metadata.tipo === "venta") {
      await procesarPagoVenta(supabase, payment, metadata);
    } else {
      await procesarPagoAlquiler(supabase, payment, metadata);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err);
    return NextResponse.json({ error: "Error procesando el pago" }, { status: 500 });
  }
}
