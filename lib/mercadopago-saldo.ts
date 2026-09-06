import "server-only";
import { Preference } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

/**
 * Preferencia de Mercado Pago para el saldo de un alquiler (el 50% que
 * queda después de la seña). Se usa desde el recordatorio de retiro para
 * armar un link de pago; el webhook procesa el pago con metadata.tipo
 * "saldo" igual que ya hace con la seña y la venta.
 */
export async function crearPreferenciaSaldo(params: {
  reservationId: string;
  productoId: string;
  productoNombre: string;
  monto: number;
  origin: string;
}): Promise<string | null> {
  try {
    const preference = await new Preference(getMercadoPagoConfig()).create({
      body: {
        items: [
          {
            id: params.productoId,
            title: `Saldo — ${params.productoNombre}`,
            quantity: 1,
            unit_price: params.monto,
            currency_id: "UYU",
          },
        ],
        metadata: {
          tipo: "saldo",
          reservation_id: params.reservationId,
        },
        back_urls: {
          success: `${params.origin}/mi-cuenta/historial`,
          pending: `${params.origin}/mi-cuenta/historial`,
          failure: `${params.origin}/mi-cuenta/historial`,
        },
        auto_return: "approved",
        notification_url: `${params.origin}/api/webhooks/mercadopago`,
      },
    });

    return preference.init_point ?? null;
  } catch (err) {
    console.error("Error creando la preferencia de saldo de Mercado Pago", err);
    return null;
  }
}
