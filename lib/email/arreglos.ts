import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { EMAIL_CONTACTO } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/site";

export type ArregloPorAlertar = {
  id: string;
  numero: number;
  sku: string;
  nombre: string;
  talle: string | null;
  detalle: string;
  fecha_retiro_clienta: string;
  dias_restantes: number;
};

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filaArreglo(a: ArregloPorAlertar): string {
  const vencido = a.dias_restantes < 0;
  return `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #EFE9DF;">${escapeHtml(a.sku)}</td>
      <td style="padding:8px; border-bottom:1px solid #EFE9DF;">${escapeHtml(a.nombre)}</td>
      <td style="padding:8px; border-bottom:1px solid #EFE9DF;">${escapeHtml(a.talle ?? "")}</td>
      <td style="padding:8px; border-bottom:1px solid #EFE9DF;">${escapeHtml(a.detalle)}</td>
      <td style="padding:8px; border-bottom:1px solid #EFE9DF; white-space:nowrap;">${formatFecha(a.fecha_retiro_clienta)}</td>
      <td style="padding:8px; border-bottom:1px solid #EFE9DF; white-space:nowrap; color:${vencido ? "#B3261E" : "#171513"}; font-weight:${vencido ? "700" : "400"};">
        ${vencido ? "VENCIDO" : `${a.dias_restantes} día(s)`}
      </td>
    </tr>`;
}

/** Ordena vencidos primero, y entre ellos por fecha más antigua. */
function ordenarParaAviso(filas: ArregloPorAlertar[]): ArregloPorAlertar[] {
  return [...filas].sort((a, b) => a.dias_restantes - b.dias_restantes);
}

export async function enviarAlertaArreglos(
  filas: ArregloPorAlertar[]
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const ordenadas = ordenarParaAviso(filas);
  const filasHtml = ordenadas.map(filaArreglo).join("");

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Arreglos sin terminar: ${filas.length} vestido(s) a 5 días o menos del retiro
      </h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px; font-size:14px;">
        <thead>
          <tr style="text-align:left; color:#A49587; font-size:12px; text-transform:uppercase;">
            <th style="padding:8px;">SKU</th>
            <th style="padding:8px;">Nombre</th>
            <th style="padding:8px;">Talle</th>
            <th style="padding:8px;">Detalle</th>
            <th style="padding:8px;">Retiro</th>
            <th style="padding:8px;">Días</th>
          </tr>
        </thead>
        <tbody>${filasHtml}</tbody>
      </table>
      <p style="margin-top:20px;"><a href="${absoluteUrl("/admin/arreglos")}">Ver la bandeja de arreglos</a></p>
    </div>
  `.trim();

  return enviarEmail({
    to: EMAIL_CONTACTO,
    subject: `Arreglos sin terminar: ${filas.length} vestido(s) a 5 días o menos del retiro`,
    html,
  });
}

/** Envía el resumen, y si salió bien registra un email_log por cada arreglo incluido. */
export async function enviarYRegistrarAlertaArreglos(
  filas: ArregloPorAlertar[]
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const resultado = await enviarAlertaArreglos(filas);
  await Promise.all(
    filas.map((a) =>
      registrarEnvioEmail({
        tipo: "alerta_arreglo",
        destinatario: EMAIL_CONTACTO,
        arregloId: a.id,
        resultado,
      })
    )
  );
  return resultado;
}
