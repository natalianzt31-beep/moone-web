import "server-only";

/**
 * Envío del e-ticket por email vía Resend (https://resend.com).
 *
 * Sin RESEND_API_KEY configurada, no envía nada y devuelve
 * { ok: false, reason: "email_not_configured" } — el comprobante sigue
 * disponible en el panel admin (eticket_url) para reenviarlo a mano.
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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, reason: "email_not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: params.clienteEmail,
        subject: `Môone — tu comprobante ${params.numeroComprobante}`,
        html: `<p>Hola ${params.clienteNombre},</p><p>Adjuntamos tu comprobante de compra/alquiler en Môone.</p><p>¡Gracias por elegirnos!</p>`,
        attachments: [
          {
            filename: `${params.numeroComprobante}.pdf`,
            content: params.pdfBase64,
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, reason: `resend_http_${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "resend_error_desconocido" };
  }
}
