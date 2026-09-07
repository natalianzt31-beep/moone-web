import "server-only";
import { enviarEmail, resendConfigurado } from "@/lib/email/resend";
import { registrarEnvioEmail } from "@/lib/email/log";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { currencyFormatter, WHATSAPP_URL } from "@/lib/site-config";

/** A partir de cuántas horas sin moverse se considera abandonado un carrito. */
const HORAS_PARA_CONSIDERAR_ABANDONADO = 3;

type Producto = { nombre: string; precio_alquiler: number; precio_venta: number | null };
type Cliente = { nombre: string; email: string | null; consiente_promos: boolean };

type FilaCartItem = {
  id: string;
  tipo: "alquiler" | "venta";
  carts: { clients: Cliente | Cliente[] | null } | { clients: Cliente | Cliente[] | null }[] | null;
  products: Producto | Producto[] | null;
};

type ItemAbandonado = { tipo: "alquiler" | "venta"; producto: Producto | null };

function primero<T>(valor: T | T[] | null): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function armarHtml(clienteNombre: string, items: ItemAbandonado[]): string {
  const filas = items
    .map((item) => {
      const nombre = item.producto?.nombre ?? "Prenda";
      const precio =
        item.tipo === "venta" ? item.producto?.precio_venta : item.producto?.precio_alquiler;
      const precioTexto = precio != null ? ` — ${currencyFormatter.format(precio)}` : "";
      return `<li>${nombre}${precioTexto}</li>`;
    })
    .join("");

  return `
    <p>Hola ${clienteNombre},</p>
    <p>Vimos que dejaste estas prendas en tu carrito de Môone:</p>
    <ul>${filas}</ul>
    <p>Todavía están disponibles. Entrá a tu cuenta para completar la reserva o compra,
    o escribinos por WhatsApp si tenés alguna duda: <a href="${WHATSAPP_URL}">${WHATSAPP_URL}</a></p>
    <p>¡Te esperamos!</p>
  `.trim();
}

/**
 * Busca carritos con ítems abandonados (agregados hace más de
 * HORAS_PARA_CONSIDERAR_ABANDONADO horas, sin recordatorio previo), manda
 * un mail por clienta con todo lo pendiente, y marca esos ítems para no
 * volver a avisarle por lo mismo. No hace nada si Resend no está
 * configurada — hoy no lo está, así que esto es un no-op hasta que se
 * carguen RESEND_API_KEY / RESEND_FROM_EMAIL.
 */
export async function enviarRecordatoriosCarritosAbandonados(): Promise<{
  configurado: boolean;
  clientasNotificadas: number;
  itemsMarcados: number;
}> {
  if (!resendConfigurado()) {
    return { configurado: false, clientasNotificadas: 0, itemsMarcados: 0 };
  }

  const supabase = getSupabaseServiceClient();
  const limite = new Date(
    Date.now() - HORAS_PARA_CONSIDERAR_ABANDONADO * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, tipo, carts(clients(nombre, email, consiente_promos)), products(nombre, precio_alquiler, precio_venta)")
    .lt("created_at", limite)
    .is("recordatorio_enviado_at", null);

  const items = (data ?? []) as unknown as FilaCartItem[];
  if (error || items.length === 0) {
    return { configurado: true, clientasNotificadas: 0, itemsMarcados: 0 };
  }

  const porClienta = new Map<
    string,
    { nombre: string; items: ItemAbandonado[]; itemIds: string[] }
  >();

  for (const fila of items) {
    const cart = primero(fila.carts);
    const cliente = cart ? primero(cart.clients) : null;
    if (!cliente?.email || !cliente.consiente_promos) continue;

    const entry = porClienta.get(cliente.email) ?? {
      nombre: cliente.nombre,
      items: [],
      itemIds: [],
    };
    entry.items.push({ tipo: fila.tipo, producto: primero(fila.products) });
    entry.itemIds.push(fila.id);
    porClienta.set(cliente.email, entry);
  }

  let clientasNotificadas = 0;
  let itemsMarcados = 0;

  for (const [email, { nombre, items: itemsClienta, itemIds }] of porClienta.entries()) {
    const resultado = await enviarEmail({
      to: email,
      subject: "Te olvidaste algo en tu carrito de Môone",
      html: armarHtml(nombre, itemsClienta),
    });

    await registrarEnvioEmail({
      tipo: "promocion",
      destinatario: email,
      reservationId: null,
      resultado,
    });

    if (resultado.ok) {
      clientasNotificadas += 1;
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ recordatorio_enviado_at: new Date().toISOString() })
        .in("id", itemIds);
      if (!updateError) itemsMarcados += itemIds.length;
    }
  }

  return { configurado: true, clientasNotificadas, itemsMarcados };
}
