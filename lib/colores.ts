// Agrupa los colores específicos del catálogo (p. ej. "Verde oliva", "Verde
// azulado", "Celeste") en su color principal (p. ej. "Verde", "Azul") para
// que los filtros de color le muestren a la clienta pocas opciones simples
// en vez de cada tono puntual del stock.
const FAMILIA_POR_COLOR: Record<string, string> = {
  amarillo: "Amarillo",
  azul: "Azul",
  "azul electrico": "Azul",
  "azul marino": "Azul",
  "azul petroleo": "Azul",
  celeste: "Azul",
  beige: "Beige",
  camel: "Beige",
  nude: "Beige",
  blanco: "Blanco",
  perlado: "Blanco",
  bordo: "Bordo",
  borgona: "Bordo",
  bronce: "Dorado",
  coral: "Naranja",
  dorado: "Dorado",
  "dorado/plateado": "Multicolor",
  durazno: "Naranja",
  fucsia: "Rosa",
  gris: "Gris",
  peltre: "Plateado",
  lila: "Violeta",
  magenta: "Rosa",
  marron: "Marrón",
  multicolor: "Multicolor",
  naranja: "Naranja",
  negro: "Negro",
  "oro rosa": "Dorado",
  plateado: "Plateado",
  rojo: "Rojo",
  rosa: "Rosa",
  "rosa dorado": "Dorado",
  "rosa viejo": "Rosa",
  terracota: "Naranja",
  verde: "Verde",
  "verde agua": "Verde",
  "verde azulado": "Verde",
  "verde oliva": "Verde",
  "verde oscuro": "Verde",
  violeta: "Violeta",
};

// Orden de despliegue de las familias en los selects de filtro.
export const ORDEN_COLORES_PRINCIPALES = [
  "Negro",
  "Blanco",
  "Gris",
  "Beige",
  "Marrón",
  "Rojo",
  "Bordo",
  "Rosa",
  "Naranja",
  "Amarillo",
  "Verde",
  "Azul",
  "Violeta",
  "Dorado",
  "Plateado",
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
