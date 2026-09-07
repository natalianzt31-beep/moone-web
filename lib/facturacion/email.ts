import "server-only";
import { enviarEmail, resendConfigurado } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";

/**
 * Envío del e-ticket por email. Sin Resend configurada, no envía nada y
 * devuelve { ok: false, reason: "email_not_configured" } — el comprobante
 * sigue disponible en el panel admin (eticket_url) para reenviarlo a mano.
 */

export type EnviarETicketParams = {
  clienteEmail: string;
  clienteNombre: string;
  numeroComprobante: string;
  pdfBase64: string;
  /** null para una venta (no está atada a ninguna reserva). */
  reservationId: string | null;
};

export async function enviarETicketPorEmail(
  params: EnviarETicketParams
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!resendConfigurado()) {
    const resultado = { ok: false as const, reason: "email_not_configured" };
    await registrarEnvioEmail({
      tipo: "eticket",
      destinatario: params.clienteEmail,
      reservationId: params.reservationId,
      resultado,
    });
    return resultado;
  }

  const resultado = await enviarEmail({
    to: params.clienteEmail,
    subject: `Môone — tu comprobante ${params.numeroComprobante}`,
    html: `<p>Hola ${params.clienteNombre},</p><p>Adjuntamos tu comprobante de compra/alquiler en Môone.</p><p>¡Gracias por elegirnos!</p>`,
    attachments: [
      {
        filename: `${params.numeroComprobante}.pdf`,
        content: params.pdfBase64,
      },
    ],
  });

  await registrarEnvioEmail({
    tipo: "eticket",
    destinatario: params.clienteEmail,
    reservationId: params.reservationId,
    resultado,
  });

  return resultado;
}
