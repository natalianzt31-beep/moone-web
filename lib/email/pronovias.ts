import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { BUSINESS } from "@/lib/site";
import { EMAIL_CECILIA_MENDEZ, WHATSAPP_DISPLAY } from "@/lib/site-config";
import { PLANTILLA_CONFIRMACION_LEAD_PRONOVIAS } from "@/lib/email/plantillas";

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type LeadPronovias = {
  nombre: string;
  email: string;
  celular: string;
  fechaCasamientoEstimada: string | null;
};

/** Mail a la interesada confirmando que recibimos sus datos. */
export async function enviarConfirmacionLeadPronovias(
  lead: LeadPronovias
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const html = PLANTILLA_CONFIRMACION_LEAD_PRONOVIAS.replace(
    "{{nombre}}",
    escapeHtml(lead.nombre)
  )
    .replace("{{celular}}", escapeHtml(lead.celular))
    .replaceAll("{{whatsapp_display}}", WHATSAPP_DISPLAY);

  return enviarEmail({
    to: lead.email,
    subject: "Recibimos tus datos — Cecilia Méndez × Pronovias",
    html,
  });
}

function filaHtml(etiqueta: string, valor: string): string {
  if (!valor) return "";
  return `
    <tr>
      <td style="padding: 8px 0; color:#A49587; font-size: 13px; vertical-align: top; white-space:nowrap;">${etiqueta}</td>
      <td style="padding: 8px 0 8px 16px; color:#171513; font-size: 14px;">${escapeHtml(valor)}</td>
    </tr>`;
}

/** Aviso interno a contacto@moone.com.uy y a Cecilia Méndez de que llegó un lead nuevo, para coordinar por WhatsApp. */
export async function enviarAvisoNuevoLeadPronovias(
  lead: LeadPronovias
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const filas = [
    filaHtml("Nombre", lead.nombre),
    filaHtml("Email", lead.email),
    filaHtml("Celular", lead.celular),
    filaHtml(
      "Fecha de casamiento estimada",
      lead.fechaCasamientoEstimada ? formatFecha(lead.fechaCasamientoEstimada) : "No especificó"
    ),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Nuevo lead — Cecilia Méndez × Pronovias
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 20px;">
        Coordinar día y horario de prueba por WhatsApp.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  return enviarEmail({
    to: [BUSINESS.email, EMAIL_CECILIA_MENDEZ],
    subject: `Nuevo lead Pronovias — ${lead.nombre}`,
    html,
  });
}
