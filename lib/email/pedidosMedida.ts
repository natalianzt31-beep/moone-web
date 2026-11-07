import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { currencyFormatter } from "@/lib/site-config";

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Mail "Recibimos tu pago" tras pm_registrar_pago. Si falla el envío, el
 * pago queda registrado igual (ver pm_registrar_pago) — acá solo se avisa.
 */
export async function enviarMailPagoRecibido(params: {
  pedidoId: string;
  monto: number;
  tipo: "seña" | "saldo";
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = getSupabaseServiceClient();

  const { data: pedido, error } = await supabase
    .from("pedidos_medida_cobros")
    .select("nombre, email, pagado, monto_presupuestado, saldo, fecha_retiro")
    .eq("id", params.pedidoId)
    .single();

  if (error || !pedido?.email) {
    return { ok: false, reason: "pedido_sin_email" };
  }

  const bloqueRetiro = pedido.fecha_retiro
    ? `<p>Retiro: <strong>${formatFecha(pedido.fecha_retiro)}</strong></p>`
    : "";

  const html = `
    <p>Hola ${pedido.nombre},</p>
    <p>Recibimos un pago por <strong>${currencyFormatter.format(params.monto)}</strong>
    (${params.tipo}) de tu vestido a medida.</p>
    <p>Pagado a la fecha: ${currencyFormatter.format(pedido.pagado)} de
    ${currencyFormatter.format(pedido.monto_presupuestado)}.</p>
    <p>Saldo pendiente: <strong>${currencyFormatter.format(pedido.saldo)}</strong>.</p>
    ${bloqueRetiro}
    <p>¡Gracias por elegirnos!</p>
  `.trim();

  const resultado = await enviarEmail({
    to: pedido.email,
    subject: "Recibimos tu pago",
    html,
  });

  await registrarEnvioEmail({
    tipo: "pago_recibido",
    destinatario: pedido.email,
    pedidoMedidaId: params.pedidoId,
    resultado,
  });

  return resultado;
}
