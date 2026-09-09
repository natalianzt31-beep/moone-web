// Guarda en sessionStorage el producto que una clienta sin sesión quiso
// reservar o agregar al carrito, para poder completarlo automáticamente
// después de que inicie sesión o se registre (ver returnTo en las páginas
// de login/registro).

const STORAGE_KEY = "moone_pedido_pendiente";

export type PedidoPendiente = {
  productId: string;
  talle: string | null;
  tipo: "alquiler" | "venta";
  url: string;
};

export function guardarPedidoPendiente(item: PedidoPendiente) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(item));
  } catch {
    // sessionStorage no disponible (ej. modo privado) — no hay nada más que hacer
  }
}

export function leerPedidoPendiente(): PedidoPendiente | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PedidoPendiente;
  } catch {
    return null;
  }
}

export function limpiarPedidoPendiente() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
