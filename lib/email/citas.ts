import "server-only";
import { enviarEmail, type EmailAttachment } from "@/lib/email/resend";
import { absoluteUrl, BUSINESS } from "@/lib/site";
import { WHATSAPP_DISPLAY } from "@/lib/site-config";
import { PLANTILLA_CONFIRMACION_TURNO } from "@/lib/email/plantillas";

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "viernes 12 de septiembre" — sin año, con día de la semana. */
function formatFechaConDia(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
}

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Turno = {
  nombre: string;
  email: string;
  celular: string;
  fecha: string;
  hora: string;
  fecha_fiesta: string;
  token: string;
};

/** Mail a la clienta confirmando el turno, con el link para darse de baja. */
export async function enviarConfirmacionTurno(
  turno: Turno
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const linkCancelar = absoluteUrl(`/turnos/cancelar/${turno.token}`);

  const html = PLANTILLA_CONFIRMACION_TURNO.replace("{{nombre}}", escapeHtml(turno.nombre))
    .replace("{{fecha_turno}}", formatFechaConDia(turno.fecha))
    .replace("{{hora_turno}}", turno.hora)
    .replace("{{fecha_fiesta}}", formatFecha(turno.fecha_fiesta))
    .replace("{{link_cancelar}}", linkCancelar)
    .replaceAll("{{whatsapp_display}}", WHATSAPP_DISPLAY);

  return enviarEmail({
    to: turno.email,
    subject: "¡Tu turno con la modista está confirmado!",
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

/** Aviso interno a la tienda de que se agendó un turno nuevo, con la foto de referencia adjunta. */
export async function enviarAvisoNuevoTurno(
  turno: Turno,
  imagen: { nombreArchivo: string; base64: string }
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const filas = [
    filaHtml("Nombre", turno.nombre),
    filaHtml("Email", turno.email),
    filaHtml("Celular", turno.celular),
    filaHtml("Turno", `${formatFechaConDia(turno.fecha)} a las ${turno.hora}`),
    filaHtml("Fecha de la fiesta", formatFecha(turno.fecha_fiesta)),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Nuevo turno con la modista
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 20px;">La foto de referencia va adjunta a este mail.</p>
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  const attachments: EmailAttachment[] = [
    { filename: imagen.nombreArchivo, content: imagen.base64 },
  ];

  return enviarEmail({
    to: BUSINESS.email,
    subject: `Nuevo turno — ${turno.nombre} (${formatFechaConDia(turno.fecha)} ${turno.hora})`,
    html,
    attachments,
  });
}
