/**
 * Flags para desactivar temporalmente reservas y compra/pago en el sitio
 * público, sin borrar código. Por defecto (variables sin definir) quedan
 * en false — hay que definirlas explícitamente en `true` para reactivar.
 */
export const bookingEnabled = process.env.NEXT_PUBLIC_ENABLE_BOOKING === "true";
export const checkoutEnabled = process.env.NEXT_PUBLIC_ENABLE_CHECKOUT === "true";
