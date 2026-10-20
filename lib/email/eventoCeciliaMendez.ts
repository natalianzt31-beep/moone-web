import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { absoluteUrl, BUSINESS } from "@/lib/site";
import { WHATSAPP_DISPLAY } from "@/lib/site-config";
import { PLANTILLA_CONFIRMACION_EVENTO_CECILIA_MENDEZ } from "@/lib/email/plantillas";

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type TurnoEvento = {
  nombre: string;
  email: string;
  celular: string;
  hora: string;
  token: string;
};

/** Mail a la clienta confirmando el turno del evento Cecilia Méndez × Pronovias. */
export async function enviarConfirmacionEventoCeciliaMendez(
  turno: TurnoEvento
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const linkCancelar = absoluteUrl(`/evento-cecilia-mendez/cancelar/${turno.token}`);

  const html = PLANTILLA_CONFIRMACION_EVENTO_CECILIA_MENDEZ.replace(
    "{{nombre}}",
    escapeHtml(turno.nombre)
  )
    .replace("{{hora_turno}}", turno.hora)
    .replace("{{link_cancelar}}", linkCancelar)
    .replaceAll("{{whatsapp_display}}", WHATSAPP_DISPLAY);

  return enviarEmail({
    to: turno.email,
    subject: "¡Tu turno con Cecilia Méndez — Pronovias está confirmado!",
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

/** Aviso interno a contacto@moone.com.uy de que se agendó un turno nuevo del evento. */
export async function enviarAvisoNuevoTurnoEvento(
  turno: TurnoEvento
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const filas = [
    filaHtml("Nombre", turno.nombre),
    filaHtml("Email", turno.email),
    filaHtml("Celular", turno.celular),
    filaHtml("Turno", `Viernes 13 de noviembre a las ${turno.hora}`),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Nuevo turno — Cecilia Méndez × Pronovias
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 20px;">
        Evento del 13/11 en el atelier de Victoria Vidarte.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  return enviarEmail({
    to: BUSINESS.email,
    subject: `Nuevo turno Cecilia Méndez — ${turno.nombre} (${turno.hora})`,
    html,
  });
}
