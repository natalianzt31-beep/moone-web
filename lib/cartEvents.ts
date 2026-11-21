export const CART_UPDATED_EVENT = "moone:cart-updated";

/** Avisa a quien esté escuchando (ej. el ícono de carrito del Nav) que el carrito cambió. */
export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}
