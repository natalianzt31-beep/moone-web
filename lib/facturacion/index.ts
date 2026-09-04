import "server-only";
import { emitirETicket, obtenerPdfETicket, type ClienteFactura } from "@/lib/facturacion/memory";
import { enviarETicketPorEmail } from "@/lib/facturacion/email";

export type FacturarResultado = {
  eticket_generado: boolean;
  eticket_url: string | null;
  eticket_numero: string | null;
  /** Motivo si no se pudo facturar y/o enviar (para loguear, nunca bloquea el flujo). */
  detalle?: string;
};

/**
 * Emite el e-ticket por el total de la operación y lo envía por mail.
 * Nunca lanza: si Memory o el email no están configurados (o fallan), devuelve
 * eticket_generado:false con el detalle, para reintentar manualmente después.
 */
export async function facturarYEnviar(params: {
  cliente: ClienteFactura;
  clienteEmail: string | null;
  medioPago: string;
  codigoProducto: string;
  descripcion: string;
  total: number;
}): Promise<FacturarResultado> {
  const emision = await emitirETicket({
    cliente: params.cliente,
    medioPago: params.medioPago,
    total: params.total,
    lineas: [
      {
        codigo: params.codigoProducto,
        descripcion: params.descripcion,
        cantidad: 1,
        precioFinal: params.total,
      },
    ],
  });

  if (!emision.ok) {
    console.error("[facturacion] no se pudo emitir el e-ticket:", emision.reason);
    return { eticket_generado: false, eticket_url: null, eticket_numero: null, detalle: emision.reason };
  }

  const numero = `${emision.serie}-${emision.numero}`;
  const pdf = await obtenerPdfETicket(emision.serie, emision.numero);

  let eticket_url: string | null = null;
  if (pdf.ok) {
    // Se guarda como data URL: no hay bucket de Storage configurado todavía
    // para comprobantes. Si el PDF es grande, conviene subirlo a Supabase
    // Storage y guardar esa URL en su lugar.
    eticket_url = `data:application/pdf;base64,${pdf.pdfBase64}`;

    if (params.clienteEmail) {
      const envio = await enviarETicketPorEmail({
        clienteEmail: params.clienteEmail,
        clienteNombre: params.cliente.nombre,
        numeroComprobante: numero,
        pdfBase64: pdf.pdfBase64,
      });
      if (!envio.ok) {
        console.error("[facturacion] e-ticket emitido pero no se pudo enviar por mail:", envio.reason);
      }
    }
  } else {
    console.error("[facturacion] e-ticket emitido pero no se pudo descargar el PDF:", pdf.reason);
  }

  return { eticket_generado: true, eticket_url, eticket_numero: numero };
}
