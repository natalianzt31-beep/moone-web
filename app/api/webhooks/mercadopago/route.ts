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

    if (payment.status === "approved" && payment.external_reference) {
      const supabase = getSupabaseServiceClient();

      const { error: updateError } = await supabase
        .from("reservations")
        .update({ senia_confirmada: true })
        .eq("id", payment.external_reference);
      if (updateError) {
        console.error("No se pudo marcar senia_confirmada", updateError);
      }

      const { error: insertError } = await supabase.from("payments").insert({
        reservation_id: payment.external_reference,
        medio: "mercado_pago",
        tipo: "seña",
        monto: payment.transaction_amount ?? 0,
        mp_payment_id: String(payment.id),
      });
      // 23505 = mp_payment_id repetido: Mercado Pago reenvía la misma
      // notificación varias veces, así que un duplicado acá es esperable.
      if (insertError && insertError.code !== "23505") {
        console.error("No se pudo registrar el pago", insertError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err);
    return NextResponse.json({ error: "Error procesando el pago" }, { status: 500 });
  }
}
