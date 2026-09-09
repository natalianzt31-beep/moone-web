import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { currencyFormatter } from "@/lib/site-config";
import { PLANTILLA_CONFIRMACION_RESERVA } from "@/lib/email/plantillas";

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "viernes 12 de septiembre" — sin año, con día de la semana. */
function formatFechaConDia(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
}

const numeroFormatter = new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 });

type ProductoFila = {
  nombre: string;
  talle: string | null;
  color: string | null;
  precio_alquiler: number;
};
type ClienteFila = { nombre: string; email: string | null };
type ReservaDelPedido = {
  id: string;
  fecha_retiro: string;
  fecha_devolucion: string;
  senia: number;
  precio_total: number;
  products: ProductoFila | ProductoFila[] | null;
  clients: ClienteFila | ClienteFila[] | null;
};

function primero<T>(valor: T | T[] | null): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function filaItemHtml(producto: ProductoFila | null): string {
  const nombre = producto?.nombre ?? "Prenda";
  const detalle = [producto?.talle, producto?.color].filter(Boolean).join(" · ");
  const precio = producto ? `$${numeroFormatter.format(producto.precio_alquiler)}` : "";

  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #EFE9DF;">
        <p style="color:#171513; font-size: 15px; font-weight:600; margin:0;">${nombre}</p>
        ${detalle ? `<p style="color:#A49587; font-size: 13px; margin: 4px 0 0;">${detalle}</p>` : ""}
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #EFE9DF; white-space:nowrap; vertical-align: top;">
        <p style="color:#171513; font-size: 14px; font-weight:600; margin:0;">${precio}</p>
      </td>
    </tr>`;
}

/**
 * Junta todas las reservas de un pedido (un mismo pedido_id: por ejemplo,
 * vestido + sandalias reservados juntos) y manda un solo mail de
 * confirmación con todas las prendas, la seña total pagada y el saldo
 * total pendiente. Registra un intento en email_log por cada reserva del
 * pedido, para poder auditar cada una individualmente.
 */
export async function enviarMailConfirmacionReserva(
  pedidoId: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, fecha_retiro, fecha_devolucion, senia, precio_total, products(nombre, talle, color, precio_alquiler), clients(nombre, email)"
    )
    .eq("pedido_id", pedidoId);

  const reservas = (data ?? []) as unknown as ReservaDelPedido[];
  if (error || reservas.length === 0) {
    return { ok: false, reason: "pedido_no_encontrado" };
  }

  const cliente = primero(reservas[0].clients);
  if (!cliente?.email) {
    return { ok: false, reason: "cliente_sin_email" };
  }

  const montoSenia = reservas.reduce((sum, r) => sum + r.senia, 0);
  const saldoPendiente = reservas.reduce((sum, r) => sum + (r.precio_total - r.senia), 0);
  const itemsHtml = reservas.map((r) => filaItemHtml(primero(r.products))).join("");

  const html = PLANTILLA_CONFIRMACION_RESERVA.replace("{{items_html}}", `<table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>`)
    .replace("{{fecha_retiro}}", formatFechaConDia(reservas[0].fecha_retiro))
    .replace("{{fecha_devolucion}}", formatFechaConDia(reservas[0].fecha_devolucion))
    .replace("{{monto_senia}}", numeroFormatter.format(montoSenia))
    .replace("{{saldo_pendiente}}", numeroFormatter.format(saldoPendiente));

  const resultado = await enviarEmail({
    to: cliente.email,
    subject: "¡Tu reserva en Môone está confirmada!",
    html,
  });

  await Promise.all(
    reservas.map((r) =>
      registrarEnvioEmail({
        tipo: "confirmacion_reserva",
        destinatario: cliente.email!,
        reservationId: r.id,
        resultado,
      })
    )
  );

  return resultado;
}

export async function enviarRecordatorioRetiro(params: {
  reservationId: string;
  clienteEmail: string;
  clienteNombre: string;
  productoNombre: string;
  fechaRetiro: string;
  saldoPendiente: number;
  linkPagoSaldo: string | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const bloquePago = params.linkPagoSaldo
    ? `<p><a href="${params.linkPagoSaldo}">Pagar el saldo online</a> — o traelo en efectivo, transferencia o POS al retirar.</p>`
    : `<p>Recordá traer el saldo en efectivo, transferencia o POS al retirar.</p>`;

  const html = `
    <p>Hola ${params.clienteNombre},</p>
    <p>Te recordamos que mañana, ${formatFecha(params.fechaRetiro)}, retirás
    <strong>${params.productoNombre}</strong> en Môone.</p>
    <p>Queda un saldo pendiente de <strong>${currencyFormatter.format(params.saldoPendiente)}</strong>.</p>
    ${bloquePago}
    <p>Te esperamos en Punta Carretas. ¡Gracias por elegirnos!</p>
  `.trim();

  const resultado = await enviarEmail({
    to: params.clienteEmail,
    subject: `Môone — mañana retirás ${params.productoNombre}`,
    html,
  });

  await registrarEnvioEmail({
    tipo: "recordatorio_retiro",
    destinatario: params.clienteEmail,
    reservationId: params.reservationId,
    resultado,
  });

  return resultado;
}
