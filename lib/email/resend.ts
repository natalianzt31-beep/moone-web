import "server-only";

/**
 * Envío de emails vía Resend (https://resend.com). Sin RESEND_API_KEY /
 * RESEND_FROM_EMAIL configuradas, resendConfigurado() da false y no hay
 * que intentar enviar nada.
 */

export type EmailAttachment = { filename: string; content: string };

export function resendConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function enviarEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ ok: true } | { ok: false; reason: string }> {
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
        to: params.to,
        subject: params.subject,
        html: params.html,
        ...(params.attachments ? { attachments: params.attachments } : {}),
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
