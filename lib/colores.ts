// Agrupa los colores específicos del catálogo (p. ej. "Verde oliva", "Verde
// azulado", "Azul marino") en una familia de color simple para que los
// filtros le muestren a la clienta pocas opciones en vez de cada tono
// puntual del stock. Las familias son las más comunes para filtrar:
// blanco, negro, rojo, bordó, verde, rosado, celeste, lila, violeta,
// dorado, plateado, amarillo, anaranjado, multicolor.
const FAMILIA_POR_COLOR: Record<string, string> = {
  amarillo: "Amarillo",
  "animal print": "Multicolor",
  azul: "Celeste",
  "azul electrico": "Celeste",
  "azul marino": "Celeste",
  "azul petroleo": "Celeste",
  "azul rey": "Celeste",
  "azul violaceo": "Violeta",
  beige: "Blanco",
  blanco: "Blanco",
  bordo: "Bordó",
  bronce: "Dorado",
  camel: "Dorado",
  caramelo: "Dorado",
  celeste: "Celeste",
  chocolate: "Anaranjado",
  ciruela: "Violeta",
  coral: "Anaranjado",
  dorado: "Dorado",
  "dorado/plateado": "Multicolor",
  durazno: "Anaranjado",
  "estampado acuarela": "Multicolor",
  "estampado floral": "Multicolor",
  fucsia: "Rosado",
  gris: "Plateado",
  "gris azulado": "Celeste",
  lila: "Lila",
  magenta: "Rosado",
  malva: "Lila",
  marfil: "Blanco",
  marron: "Anaranjado",
  multicolor: "Multicolor",
  naranja: "Anaranjado",
  negro: "Negro",
  nude: "Blanco",
  "oro rosa": "Dorado",
  peltre: "Plateado",
  perlado: "Blanco",
  petroleo: "Verde",
  piel: "Blanco",
  plateado: "Plateado",
  plomo: "Plateado",
  prueba: "Multicolor",
  purpura: "Violeta",
  rojo: "Rojo",
  rosa: "Rosado",
  "rosa dorado": "Dorado",
  "rosa viejo": "Rosado",
  terracota: "Anaranjado",
  verde: "Verde",
  "verde agua": "Verde",
  "verde azulado": "Verde",
  "verde esmeralda": "Verde",
  "verde oliva": "Verde",
  "verde oscuro": "Verde",
  "verde salvia": "Verde",
  violeta: "Violeta",
};

// Orden de despliegue de las familias en los selects de filtro.
export const ORDEN_COLORES_PRINCIPALES = [
  "Blanco",
  "Negro",
  "Rojo",
  "Bordó",
  "Verde",
  "Rosado",
  "Celeste",
  "Lila",
  "Violeta",
  "Dorado",
  "Plateado",
  "Amarillo",
  "Anaranjado",
  "Multicolor",
];

function quitarAcentos(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Devuelve el color principal (familia) de un color puntual del catálogo. */
export function colorPrincipal(color: string): string {
  return FAMILIA_POR_COLOR[quitarAcentos(color)] ?? color;
}

/** Ordena colores principales según ORDEN_COLORES_PRINCIPALES; el resto, alfabético al final. */
export function compararColoresPrincipales(a: string, b: string): number {
  const ia = ORDEN_COLORES_PRINCIPALES.indexOf(a);
  const ib = ORDEN_COLORES_PRINCIPALES.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}
