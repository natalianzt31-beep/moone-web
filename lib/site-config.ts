export const DIRECCION =
  "Prudencio Vázquez y Vega 887 esq. Sarmiento, Punta Carretas, Montevideo";
export const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  `${DIRECCION}, Uruguay`
)}&output=embed`;
export const WHATSAPP_URL = "https://wa.me/59893787376";
export const WHATSAPP_DISPLAY = "093 787 376";
export const EMAIL_CONTACTO = "contacto@moone.com.uy";
/** Recibe copia del aviso de cada turno nuevo agendado en /turnos (ver lib/email/citas.ts). */
export const EMAIL_MODISTA = "mac.fesa@hotmail.com";
/** Recibe copia del aviso de cada lead nuevo de /pronovias (ver lib/email/pronovias.ts). */
export const EMAIL_CECILIA_MENDEZ = "ceciliamendezatelier@gmail.com";
/** WhatsApp directo de Cecilia Méndez, para avanzar con la prueba Pronovias (ver mail de confirmación en lib/email/pronovias.ts). */
export const WHATSAPP_CECILIA_MENDEZ_URL = "https://wa.me/59899158315";
export const WHATSAPP_CECILIA_MENDEZ_DISPLAY = "099 158 315";

export const currencyFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "UYU",
  maximumFractionDigits: 0,
});

// Categorías de alquiler "simples": un solo listado de productos por
// categoría, servidas por app/coleccion/[categoria]/page.tsx. Carteras y
// Accesorios quedaron afuera a propósito: ahora son categorías "con
// subcategorías" (ver ACCESORIOS_SUBCATEGORIAS más abajo) con sus propias
// páginas en app/coleccion/accesorios/.
export const CATEGORIAS = [
  { slug: "vestidos", label: "Vestidos", db: "vestido" },
  { slug: "monos", label: "Monos", db: "mono" },
  { slug: "sandalias", label: "Sandalias", db: "sandalias" },
  { slug: "tapados", label: "Tapados", db: "tapado" },
] as const;

/**
 * Tiles de /coleccion: las categorías "simples" de arriba, más Accesorios y
 * En Venta, que en vez de listar productos directo llevan a una grilla de
 * subcategorías (ver app/coleccion/accesorios/page.tsx y
 * app/coleccion/en-venta/page.tsx).
 */
export const COLECCION_GRID = [
  { slug: "vestidos", label: "Vestidos" },
  { slug: "monos", label: "Monos" },
  { slug: "sandalias", label: "Sandalias" },
  { slug: "tapados", label: "Tapados" },
  { slug: "accesorios", label: "Accesorios" },
  { slug: "en-venta", label: "En Venta" },
] as const;

export const ACCESORIOS_SUBCATEGORIAS = [
  {
    slug: "carteras",
    label: "Carteras",
    db: "cartera",
    portada: "/images/categorias/carteras.jpg",
  },
  {
    slug: "cintos",
    label: "Cintos",
    db: "accesorio",
    portada: "/images/accesorios/cinturon-plateado-strass.jpg",
  },
] as const;

/**
 * Subcategorías de /coleccion/en-venta. Por ahora solo vestidos en venta —
 * cuando se sume la subcategoría de otros artículos en venta, va acá.
 */
export const EN_VENTA_SUBCATEGORIAS = [
  {
    slug: "vestidos",
    label: "Vestidos en venta",
    db: "vestido",
    portada: "/images/vestidos/vestido-plateado-corset-tajo.jpg",
  },
] as const;

/**
 * Horario de atención de la modista para /turnos. diaSemana usa el valor de
 * Date.getDay() (5 = viernes, 6 = sábado). Un turno dura duracionMinutos y
 * el último empieza a horaFin menos esa duración (ej: viernes hasta 18:00,
 * mangas de 30 min -> el último turno arranca a las 17:30).
 */
export const AGENDA_MODISTA = {
  diasDisponibles: [
    { diaSemana: 5, etiqueta: "Viernes", horaInicio: "14:00", horaFin: "18:00" },
    { diaSemana: 6, etiqueta: "Sábado", horaInicio: "10:00", horaFin: "18:00" },
  ],
  duracionMinutos: 30,
  /** Cuántas semanas hacia adelante se muestran para agendarse. */
  semanasVisibles: 6,
} as const;
