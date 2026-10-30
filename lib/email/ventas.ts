import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { BUSINESS } from "@/lib/site";
import { currencyFormatter } from "@/lib/site-config";

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filaHtml(etiqueta: string, valor: string): string {
  if (!valor) return "";
  return `
    <tr>
      <td style="padding: 8px 0; color:#A49587; font-size: 13px; vertical-align: top; white-space:nowrap;">${etiqueta}</td>
      <td style="padding: 8px 0 8px 16px; color:#171513; font-size: 14px;">${escapeHtml(valor)}</td>
    </tr>`;
}

/**
 * Aviso interno a contacto@moone.com.uy cada vez que se confirma la venta
 * definitiva de un vestido (pago aprobado por Mercado Pago o confirmado a
 * mano desde Reportes). Como es único, para ese momento ya se sacó de la
 * web (estado pasa a baja_definitiva antes de llamar a esta función).
 */
export async function enviarAvisoVentaVestido(params: {
  sku: string;
  nombre: string;
  talle: string | null;
  color: string | null;
  monto: number;
  medioPago: string;
  clienteNombre: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const detalle = [params.talle, params.color].filter(Boolean).join(" · ");

  const filas = [
    filaHtml("Prenda", params.nombre),
    filaHtml("SKU", params.sku),
    filaHtml("Talle / color", detalle),
    filaHtml("Precio", currencyFormatter.format(params.monto)),
    filaHtml("Medio de pago", params.medioPago),
    filaHtml("Clienta", params.clienteNombre),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Se vendió un vestido
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 20px;">
        Venta definitiva confirmada — como es única, ya se sacó de la web.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  return enviarEmail({
    to: BUSINESS.email,
    subject: `Se vendió — ${params.nombre}`,
    html,
  });
}
