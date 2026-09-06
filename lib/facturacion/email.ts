import "server-only";
import { enviarEmail, resendConfigurado } from "@/lib/email/resend";

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
};

export async function enviarETicketPorEmail(
  params: EnviarETicketParams
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!resendConfigurado()) {
    return { ok: false, reason: "email_not_configured" };
  }

  return enviarEmail({
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
}
