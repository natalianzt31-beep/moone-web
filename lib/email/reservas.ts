import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { currencyFormatter, WHATSAPP_URL } from "@/lib/site-config";

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function enviarConfirmacionReserva(params: {
  reservationId: string;
  clienteEmail: string;
  clienteNombre: string;
  productoNombre: string;
  fechaRetiro: string;
  fechaDevolucion: string;
  seniaPagada: number;
  saldoPendiente: number;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const html = `
    <p>Hola ${params.clienteNombre},</p>
    <p>Confirmamos tu reserva en Môone:</p>
    <ul>
      <li><strong>Prenda:</strong> ${params.productoNombre}</li>
      <li><strong>Retiro:</strong> ${formatFecha(params.fechaRetiro)}</li>
      <li><strong>Devolución:</strong> ${formatFecha(params.fechaDevolucion)}</li>
      <li><strong>Seña pagada:</strong> ${currencyFormatter.format(params.seniaPagada)}</li>
      <li><strong>Saldo pendiente:</strong> ${currencyFormatter.format(params.saldoPendiente)} (se abona al retirar la prenda)</li>
    </ul>
    <p>Cualquier consulta, escribinos por WhatsApp: <a href="${WHATSAPP_URL}">${WHATSAPP_URL}</a></p>
    <p>¡Te esperamos!</p>
  `.trim();

  const resultado = await enviarEmail({
    to: params.clienteEmail,
    subject: `Môone — reserva confirmada: ${params.productoNombre}`,
    html,
  });

  await registrarEnvioEmail({
    tipo: "confirmacion_reserva",
    destinatario: params.clienteEmail,
    reservationId: params.reservationId,
    resultado,
  });

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
