import "server-only";
import { enviarEmail } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { currencyFormatter, WHATSAPP_DISPLAY } from "@/lib/site-config";
import { PLANTILLA_CONFIRMACION_RESERVA } from "@/lib/email/plantillas";
import { BUSINESS } from "@/lib/site";
import { fotoProductoHtml } from "@/lib/email/fotoProducto";

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
  fotos?: string[] | null;
  foto_url?: string | null;
};
type ClienteFila = { nombre: string; email: string | null };
type ReservaDelPedido = {
  id: string;
  numero_pedido: number | null;
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
  pedidoId: string,
  opciones?: { cc?: string | string[]; pagoConfirmado?: boolean }
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const pagoConfirmado = opciones?.pagoConfirmado ?? true;
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, numero_pedido, fecha_retiro, fecha_devolucion, senia, precio_total, products(nombre, talle, color, precio_alquiler), clients(nombre, email)"
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
    .replace("{{numero_pedido}}", String(reservas[0].numero_pedido ?? "—"))
    .replace("{{fecha_retiro}}", formatFechaConDia(reservas[0].fecha_retiro))
    .replace("{{fecha_devolucion}}", formatFechaConDia(reservas[0].fecha_devolucion))
    .replace("{{monto_senia}}", numeroFormatter.format(montoSenia))
    .replace("{{saldo_pendiente}}", numeroFormatter.format(saldoPendiente))
    .replace("{{titulo}}", pagoConfirmado ? "¡Reserva confirmada!" : "¡Reserva registrada!")
    .replace(
      "{{intro_texto}}",
      pagoConfirmado
        ? "Recibimos tu seña."
        : "Te guardamos las fechas — la seña se abona al retirar, en el local."
    )
    .replace("{{label_senia}}", pagoConfirmado ? "Seña pagada" : "Seña a abonar en el local")
    .replaceAll("{{whatsapp_display}}", WHATSAPP_DISPLAY);

  const numeroPedidoTexto = reservas[0].numero_pedido ? ` — Pedido #${reservas[0].numero_pedido}` : "";
  const resultado = await enviarEmail({
    to: cliente.email,
    cc: opciones?.cc,
    subject: (pagoConfirmado ? "¡Tu reserva en Môone está confirmada!" : "¡Tu reserva en Môone quedó registrada!") + numeroPedidoTexto,
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

function filaAvisoHtml(etiqueta: string, valor: string): string {
  if (!valor) return "";
  return `
    <tr>
      <td style="padding: 8px 0; color:#A49587; font-size: 13px; vertical-align: top; white-space:nowrap;">${etiqueta}</td>
      <td style="padding: 8px 0 8px 16px; color:#171513; font-size: 14px;">${valor}</td>
    </tr>`;
}

type ClienteConCelular = { nombre: string; email: string | null; celular: string | null };
type ReservaParaAviso = {
  id: string;
  numero_pedido: number | null;
  fecha_retiro: string;
  fecha_devolucion: string;
  senia: number;
  precio_total: number;
  medio_pago: string | null;
  products: ProductoFila | ProductoFila[] | null;
  clients: ClienteConCelular | ClienteConCelular[] | null;
};

/**
 * Aviso interno a contacto@moone.com.uy cada vez que se crea una reserva
 * desde la web (con Mercado Pago ya acreditado, o eligiendo pagar en el
 * local). Junta todas las reservas del mismo pedido_id en un solo mail,
 * igual que la confirmación que recibe la clienta.
 */
export async function enviarAvisoReservaInterno(
  pedidoId: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, numero_pedido, fecha_retiro, fecha_devolucion, senia, precio_total, medio_pago, products(nombre, talle, color, precio_alquiler, fotos, foto_url), clients(nombre, email, celular)"
    )
    .eq("pedido_id", pedidoId);

  const reservas = (data ?? []) as unknown as ReservaParaAviso[];
  if (error || reservas.length === 0) {
    return { ok: false, reason: "pedido_no_encontrado" };
  }

  const cliente = primero(reservas[0].clients);
  const montoSenia = reservas.reduce((sum, r) => sum + r.senia, 0);
  const itemsTexto = reservas
    .map((r) => {
      const producto = primero(r.products);
      return escapeHtml([producto?.nombre, producto?.talle, producto?.color].filter(Boolean).join(" · "));
    })
    .join("<br/>");

  const medioPagoLabel =
    reservas[0].medio_pago === "mercado_pago"
      ? "Mercado Pago — seña ya acreditada"
      : "Paga en el local — seña pendiente de confirmar";

  const filas = [
    filaAvisoHtml("N° de pedido", `#${reservas[0].numero_pedido ?? "—"}`),
    filaAvisoHtml("Clienta", escapeHtml(cliente?.nombre ?? "—")),
    filaAvisoHtml("Celular", escapeHtml(cliente?.celular ?? "—")),
    filaAvisoHtml("Mail", escapeHtml(cliente?.email ?? "—")),
    filaAvisoHtml("Prenda(s)", itemsTexto),
    filaAvisoHtml("Retiro", formatFechaConDia(reservas[0].fecha_retiro)),
    filaAvisoHtml("Devolución", formatFechaConDia(reservas[0].fecha_devolucion)),
    filaAvisoHtml("Seña", `$${numeroFormatter.format(montoSenia)}`),
    filaAvisoHtml("Medio de pago", medioPagoLabel),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Nueva reserva desde la web
      </h1>
      ${reservas.map((r) => fotoProductoHtml(primero(r.products))).join("")}
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  return enviarEmail({
    to: BUSINESS.email,
    subject: `Nueva reserva — ${cliente?.nombre ?? "clienta"}`,
    html,
  });
}

/**
 * Aviso interno a contacto@moone.com.uy cuando el staff carga una reserva
 * directo desde el admin (/admin/reservas), con la foto de la prenda. Las
 * reservas de la web ya avisan con enviarAvisoReservaInterno.
 */
export async function enviarAvisoReservaAdmin(
  reservaId: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, numero_pedido, fecha_retiro, fecha_devolucion, senia, precio_total, medio_pago, products(sku, nombre, talle, color, precio_alquiler, fotos, foto_url), clients(nombre, email, celular)"
    )
    .eq("id", reservaId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "reserva_no_encontrada" };
  }

  type ProductoConSku = ProductoFila & { sku: string };
  const reserva = data as unknown as Omit<ReservaParaAviso, "products"> & {
    products: ProductoConSku | ProductoConSku[] | null;
  };
  const producto = primero(reserva.products);
  const cliente = primero(reserva.clients);
  const prenda = [producto?.sku, producto?.nombre, producto?.talle, producto?.color]
    .filter(Boolean)
    .join(" · ");

  const filas = [
    filaAvisoHtml("N° de pedido", `#${reserva.numero_pedido ?? "—"}`),
    filaAvisoHtml("Clienta", escapeHtml(cliente?.nombre ?? "—")),
    filaAvisoHtml("Celular", escapeHtml(cliente?.celular ?? "—")),
    filaAvisoHtml("Prenda", escapeHtml(prenda || "—")),
    filaAvisoHtml("Retiro", formatFechaConDia(reserva.fecha_retiro)),
    filaAvisoHtml("Devolución", formatFechaConDia(reserva.fecha_devolucion)),
    filaAvisoHtml("Precio total", `$${numeroFormatter.format(reserva.precio_total)}`),
    filaAvisoHtml("Seña", `$${numeroFormatter.format(reserva.senia)}`),
    filaAvisoHtml("Medio de pago", escapeHtml(reserva.medio_pago ?? "—")),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Nueva reserva cargada en el admin
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 16px;">Ingresada desde el local.</p>
      ${fotoProductoHtml(producto)}
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  return enviarEmail({
    to: BUSINESS.email,
    subject: `Nueva reserva (admin) — ${producto?.nombre ?? "prenda"} · ${cliente?.nombre ?? "clienta"}`,
    html,
  });
}

/**
 * Alerta urgente a contacto@: Mercado Pago ya le cobró a la clienta pero no
 * pudimos crear la reserva (ej. esas fechas se ocuparon mientras pagaba).
 * No hay forma automática segura de reembolsar ni reasignar desde el
 * webhook — hay que resolverlo a mano, y antes esto solo quedaba en los
 * logs de Vercel, donde nadie del local lo veía.
 */
export async function enviarAlertaPagoSinReserva(params: {
  paymentId: string | number;
  productoSku?: string | null;
  productoNombre?: string | null;
  clienteNombre?: string | null;
  clienteEmail?: string | null;
  fechaRetiro: string;
  fechaDevolucion: string;
  monto: number;
  motivo: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const prenda = [params.productoSku, params.productoNombre].filter(Boolean).join(" · ");
  const filas = [
    filaAvisoHtml("Pago MP", escapeHtml(String(params.paymentId))),
    filaAvisoHtml("Clienta", escapeHtml(params.clienteNombre ?? "—")),
    filaAvisoHtml("Mail", escapeHtml(params.clienteEmail ?? "—")),
    filaAvisoHtml("Prenda", escapeHtml(prenda || "—")),
    filaAvisoHtml("Retiro", formatFechaConDia(params.fechaRetiro)),
    filaAvisoHtml("Devolución", formatFechaConDia(params.fechaDevolucion)),
    filaAvisoHtml("Monto", `$${numeroFormatter.format(params.monto)}`),
    filaAvisoHtml("Motivo", escapeHtml(params.motivo)),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#b42318; font-size: 20px; font-weight: 600; margin: 0 0 4px;">
        Pago aprobado sin reserva creada
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 16px;">
        Mercado Pago ya le cobró a la clienta, pero la reserva no se pudo registrar. Revisar a mano cuanto antes.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  return enviarEmail({
    to: BUSINESS.email,
    subject: `Pago aprobado sin reserva — ${params.clienteNombre ?? "clienta"}`,
    html,
  });
}

/**
 * Mail de cancelación para un pedido entero (todas sus reservas, por
 * ejemplo vestido + sandalias reservados juntos). No cambia el estado de
 * las reservas: eso lo hace quien llame a esta función antes de invocarla.
 */
export async function enviarMailCancelacionReserva(
  pedidoId: string,
  opciones?: { cc?: string | string[] }
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, fecha_retiro, fecha_devolucion, products(nombre, talle, color, precio_alquiler), clients(nombre, email)"
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

  const itemsTexto = reservas
    .map((r) => {
      const producto = primero(r.products);
      return escapeHtml(
        [producto?.nombre, producto?.talle, producto?.color].filter(Boolean).join(" · ")
      );
    })
    .join("<br/>");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 12px;">
        Tu reserva fue cancelada
      </h1>
      <p style="color:#171513; font-size: 14px; margin: 0 0 12px;">Hola ${escapeHtml(cliente.nombre)},</p>
      <p style="color:#171513; font-size: 14px; margin: 0 0 12px;">
        Te confirmamos que cancelamos tu reserva de:
      </p>
      <p style="color:#171513; font-size: 14px; margin: 0 0 12px;">${itemsTexto}</p>
      <p style="color:#171513; font-size: 14px; margin: 0 0 12px;">
        Retiro ${formatFechaConDia(reservas[0].fecha_retiro)} — devolución ${formatFechaConDia(reservas[0].fecha_devolucion)}.
      </p>
      <p style="color:#171513; font-size: 14px;">
        Cualquier consulta, escribinos por WhatsApp al ${WHATSAPP_DISPLAY}.
      </p>
    </div>
  `.trim();

  const resultado = await enviarEmail({
    to: cliente.email,
    cc: opciones?.cc,
    subject: "Tu reserva en Môone fue cancelada",
    html,
  });

  await Promise.all(
    reservas.map((r) =>
      registrarEnvioEmail({
        tipo: "cancelacion_reserva",
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
