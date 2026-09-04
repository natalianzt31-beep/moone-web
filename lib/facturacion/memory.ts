import "server-only";

/**
 * Cliente de Memory Gestión API (emisión de e-tickets/CFE ante DGI).
 *
 * El endpoint y el formato exacto del pedido de token OAuth2 no están en la
 * especificación de Memory (la dan aparte, junto con el KeyApp) — este
 * archivo implementa un client_credentials estándar como mejor supuesto;
 * ajustar `obtenerToken` si Memory entrega un flujo distinto.
 *
 * Mientras no estén cargadas las variables de entorno, todas las funciones
 * devuelven { ok: false, reason: "memory_not_configured" } sin lanzar error,
 * para no romper el resto del flujo de pago/reserva.
 */

const FORMA_DE_PAGO_CONTADO = 1;
const MONEDA_PESOS = 1;
const TIPO_DOC_CONSUMIDOR_FINAL = 0;
const TIPO_DOC_CI = 1;
const TIPO_DOC_RUT = 2;
const MEDIO_PAGO_MEMORY: Record<string, number> = {
  efectivo: 1,
  transferencia: 5,
  tarjeta: 4,
  mercado_pago: 9,
  otro: 1,
};

export type ClienteFactura = {
  nombre: string;
  documento?: string | null;
  /** Si el documento cargado es un RUT (empresa) en vez de CI. */
  esRut?: boolean;
};

export type LineaFactura = {
  /** Código del producto/servicio ya cargado en Memory Gestión. */
  codigo: string;
  descripcion: string;
  cantidad: number;
  /** Precio unitario final (con IVA si corresponde), ver A4.4/A1.4. */
  precioFinal: number;
};

export type EmitirETicketParams = {
  cliente: ClienteFactura;
  medioPago: string;
  lineas: LineaFactura[];
  total: number;
};

export type EmitirETicketResult =
  | { ok: true; serie: string; numero: string; comprobante: string }
  | { ok: false; reason: string };

function memoryConfigurado() {
  return Boolean(
    process.env.MEMORY_BASE_URL &&
      process.env.MEMORY_TOKEN_URL &&
      process.env.MEMORY_CLIENT_ID &&
      process.env.MEMORY_CLIENT_SECRET &&
      process.env.MEMORY_RUT_EMISOR
  );
}

function fechaDDMMAAAA(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const aaaa = date.getFullYear();
  return `${dd}${mm}${aaaa}`;
}

async function obtenerToken(): Promise<string> {
  const res = await fetch(process.env.MEMORY_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MEMORY_CLIENT_ID!,
      client_secret: process.env.MEMORY_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`No se pudo autenticar contra Memory (HTTP ${res.status})`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Memory no devolvió access_token");
  return data.access_token;
}

/** Emite un e-ticket (tipo comprobante 101) por el total indicado. */
export async function emitirETicket(params: EmitirETicketParams): Promise<EmitirETicketResult> {
  if (!memoryConfigurado()) {
    return { ok: false, reason: "memory_not_configured" };
  }

  try {
    const token = await obtenerToken();
    const hoy = fechaDDMMAAAA(new Date());
    const tipoDoc = !params.cliente.documento
      ? TIPO_DOC_CONSUMIDOR_FINAL
      : params.cliente.esRut
        ? TIPO_DOC_RUT
        : TIPO_DOC_CI;

    const body = {
      A1: {
        FormaDePago: FORMA_DE_PAGO_CONTADO,
        Moneda: MONEDA_PESOS,
        RenglonesIncluyenIva: 1,
      },
      A2: {
        RUT: process.env.MEMORY_RUT_EMISOR,
        Emision: hoy,
      },
      A3: {
        TipoDoc: tipoDoc,
        DOC: params.cliente.documento || undefined,
      },
      A4: params.lineas.map((linea) => ({
        Codigo: linea.codigo,
        Cantidad: linea.cantidad,
        SobreescribirPrecio: 1,
        PrecioFinal: linea.precioFinal,
      })),
      A5: [
        {
          Tipo: MEDIO_PAGO_MEMORY[params.medioPago] ?? MEDIO_PAGO_MEMORY.otro,
          Total: params.total,
        },
      ],
      A7: {
        Total: params.total,
      },
    };

    const res = await fetch(`${process.env.MEMORY_BASE_URL}/Ventas/SendCFE`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 204) {
      const error = await res.json().catch(() => null);
      return { ok: false, reason: error?.Mensaje ?? `memory_error_${error?.Código ?? "desconocido"}` };
    }

    if (!res.ok) {
      return { ok: false, reason: `memory_http_${res.status}` };
    }

    const data = await res.json();
    return {
      ok: true,
      serie: data?.D1?.Serie ?? "",
      numero: data?.D1?.Numero ?? "",
      comprobante: data?.D1?.Comprobante ?? "",
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "memory_error_desconocido" };
  }
}

/** Descarga el PDF del comprobante ya emitido. */
export async function obtenerPdfETicket(
  serie: string,
  numero: string
): Promise<{ ok: true; pdfBase64: string } | { ok: false; reason: string }> {
  if (!memoryConfigurado()) {
    return { ok: false, reason: "memory_not_configured" };
  }

  try {
    const token = await obtenerToken();
    const url = `${process.env.MEMORY_BASE_URL}/Ventas/GetPdf?tipoCFE=101&serie=${encodeURIComponent(
      serie
    )}&numero=${encodeURIComponent(numero)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!res.ok) return { ok: false, reason: `memory_http_${res.status}` };

    const buffer = await res.arrayBuffer();
    return { ok: true, pdfBase64: Buffer.from(buffer).toString("base64") };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "memory_error_desconocido" };
  }
}
