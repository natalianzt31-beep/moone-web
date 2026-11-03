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
 * Aviso interno a contacto@moone.com.uy cada vez que se confirma una venta
 * definitiva (pago aprobado por Mercado Pago o confirmado a mano desde
 * Reportes). stockRestante indica cuánto queda de esa prenda/talle después
 * de esta venta: si es 0, ya se sacó de la web; si es mayor, sigue
 * publicada con el stock actualizado.
 */
export async function enviarAvisoVenta(params: {
  sku: string;
  nombre: string;
  talle: string | null;
  color: string | null;
  monto: number;
  medioPago: string;
  clienteNombre: string;
  stockRestante: number;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const detalle = [params.talle, params.color].filter(Boolean).join(" · ");

  const filas = [
    filaHtml("Prenda", params.nombre),
    filaHtml("SKU", params.sku),
    filaHtml("Talle / color", detalle),
    filaHtml("Precio", currencyFormatter.format(params.monto)),
    filaHtml("Medio de pago", params.medioPago),
    filaHtml("Clienta", params.clienteNombre),
    filaHtml("Stock restante", String(params.stockRestante)),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Se vendió — ${params.stockRestante > 0 ? "sigue en stock" : "sin stock, se sacó de la web"}
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 20px;">
        Venta definitiva confirmada.
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
