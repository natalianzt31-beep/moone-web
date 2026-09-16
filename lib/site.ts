/**
 * Datos del negocio y configuración base para SEO (metadata, sitemap,
 * robots, JSON-LD). Único lugar de donde deberían salir estos valores —
 * no hardcodear el nombre, la dirección, el horario, etc. en otro lado.
 */

import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Host "canónico" del sitio (sin protocolo). Cualquier otro host que sirva
 * la misma app (el alias *.vercel.app, previews de rama, etc.) debería
 * quedar fuera de la indexación de Google — ver proxy.ts.
 */
export const CANONICAL_HOST = new URL(SITE_URL).hostname;

export const SITE_NAME = "Môone";

export const SITE_TAGLINE = "Alquiler de vestidos de fiesta en Montevideo";

/** Descripción por defecto del sitio (≤155 caracteres, para <meta name="description">). */
export const SITE_DESCRIPTION =
  "Alquiler de vestidos de fiesta en Montevideo. Curaduría, variedad de talles y asesoramiento personalizado. Retirá en Punta Carretas.";

export const SITE_LOCALE = "es-UY";
export const SITE_LOCALE_OG = "es_UY";

export const BUSINESS = {
  name: SITE_NAME,
  legalName: "Môone",
  description: SITE_DESCRIPTION,
  email: "contacto@moone.com.uy",
  /**
   * Número operativo de la tienda (el mismo que ya se usa en la UI para
   * WhatsApp, ver lib/site-config.ts) — no el personal de la fundadora.
   * En formato E.164, para JSON-LD y enlaces tel:.
   */
  phone: `+${WHATSAPP_URL.replace("https://wa.me/", "")}`,
  /** Mismo número, formateado para mostrar en pantalla. */
  phoneDisplay: WHATSAPP_DISPLAY,
  whatsappUrl: WHATSAPP_URL,
  address: {
    streetAddress: "Prudencio Vázquez y Vega 887 esq. Sarmiento",
    addressLocality: "Montevideo",
    addressRegion: "Montevideo",
    postalCode: "",
    addressCountry: "UY",
    /** Para mostrar en pantalla, incluye el barrio. */
    display:
      "Prudencio Vázquez y Vega 887 esq. Sarmiento, Punta Carretas, Montevideo, Uruguay",
    neighborhood: "Punta Carretas",
  },
  /** Horario en formato legible, para mostrar en pantalla. */
  hoursDisplay: [
    { dias: "Lunes a viernes", horario: "14:00 – 20:00" },
    { dias: "Sábados", horario: "10:00 – 16:00" },
  ],
  /**
   * Horario estructurado para JSON-LD (openingHoursSpecification).
   * dayOfWeek usa los valores de schema.org (inglés).
   */
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "14:00",
      closes: "20:00",
    },
    {
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "16:00",
    },
  ],
  areaServed: "Montevideo",
  /** Perfiles oficiales de la marca (JSON-LD `sameAs` de la home). */
  sameAs: [
    "https://www.instagram.com/moonerentalboutique",
    "https://www.tiktok.com/@moonerentalboutique",
  ] as string[],
} as const;

/** Arma una URL absoluta a partir de una ruta relativa, usando SITE_URL. */
export function absoluteUrl(path: string = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
