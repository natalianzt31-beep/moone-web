import { MercadoPagoConfig } from "mercadopago";

let config: MercadoPagoConfig | undefined;

/** Server-only: nunca importar este módulo desde un componente "use client". */
export function getMercadoPagoConfig(): MercadoPagoConfig {
  if (!config) {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("Falta la variable de entorno MERCADOPAGO_ACCESS_TOKEN");
    }
    config = new MercadoPagoConfig({ accessToken });
  }
  return config;
}
