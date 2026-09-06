import "server-only";
import { Resend } from "resend";

/**
 * Envío de emails vía Resend (https://resend.com). Sin RESEND_API_KEY /
 * RESEND_FROM_EMAIL configuradas, resendConfigurado() da false y no hay
 * que intentar enviar nada.
 */

export type EmailAttachment = { filename: string; content: string };

let client: Resend | undefined;

function getClient(): Resend | undefined {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return undefined;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function resendConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function enviarEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const from = process.env.RESEND_FROM_EMAIL;
  const resend = getClient();

  if (!resend || !from) {
    return { ok: false, reason: "email_not_configured" };
  }

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: params.attachments,
  });

  if (error) {
    return { ok: false, reason: error.message ?? "resend_error_desconocido" };
  }

  return { ok: true };
}
