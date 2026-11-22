// Reglas del módulo "Completá tu look" (venta cruzada). Todo lo que decide
// QUÉ se recomienda está acá, en un solo lugar, para poder ajustarlo sin
// tocar el motor ni los componentes:
//
//  - COMPLEMENTOS: para cada categoría elegida, qué categorías la completan
//    y en qué orden de prioridad se ofrecen.
//  - COLORES_NEUTROS: familias de color que combinan con todo.
//  - COMBINACIONES_IDEALES: pares de familias de color que quedan
//    especialmente bien juntas (se aplican en los dos sentidos).
//  - TALLE_COMPARTIDO: categorías de ropa donde conviene sugerir el mismo
//    talle que la prenda principal.
//
// Las familias de color son las de lib/colores.ts (colorPrincipal).

import type { Categoria } from "@/lib/supabase/types";

/** Qué categorías completan a cada una, en orden de prioridad. */
export const COMPLEMENTOS: Record<Categoria, Categoria[]> = {
  vestido: ["sandalias", "cartera", "tapado", "accesorio"],
  mono: ["sandalias", "cartera", "tapado", "accesorio"],
  sandalias: ["vestido", "cartera", "tapado", "mono"],
  cartera: ["vestido", "sandalias", "tapado", "mono"],
  tapado: ["vestido", "sandalias", "cartera", "mono"],
  accesorio: ["vestido", "sandalias", "cartera", "mono"],
};

/**
 * Vestido y mono cumplen el mismo rol en el look (la prenda principal):
 * si la clienta ya eligió uno, no le ofrecemos el otro.
 */
export const PRENDAS_PRINCIPALES: Categoria[] = ["vestido", "mono"];

/** Familias que combinan con cualquier color. */
export const COLORES_NEUTROS = ["Negro", "Blanco", "Dorado", "Plateado"];

/** Pares de familias que combinan especialmente bien (simétrico). */
export const COMBINACIONES_IDEALES: Array<[string, string]> = [
  ["Rojo", "Dorado"],
  ["Rojo", "Negro"],
  ["Bordó", "Dorado"],
  ["Bordó", "Negro"],
  ["Rosado", "Plateado"],
  ["Rosado", "Dorado"],
  ["Rosado", "Blanco"],
  ["Verde", "Dorado"],
  ["Verde", "Negro"],
  ["Azul", "Plateado"],
  ["Azul", "Blanco"],
  ["Celeste", "Plateado"],
  ["Celeste", "Blanco"],
  ["Lila", "Plateado"],
  ["Violeta", "Plateado"],
  ["Violeta", "Dorado"],
  ["Amarillo", "Dorado"],
  ["Amarillo", "Blanco"],
  ["Anaranjado", "Dorado"],
  ["Marrón", "Dorado"],
  ["Marrón", "Blanco"],
  ["Gris", "Plateado"],
  ["Gris", "Negro"],
  ["Negro", "Dorado"],
  ["Negro", "Plateado"],
  ["Blanco", "Dorado"],
  ["Blanco", "Plateado"],
  ["Multicolor", "Negro"],
  ["Multicolor", "Dorado"],
];

/** Categorías de ropa donde el talle de la prenda principal es relevante. */
export const TALLE_COMPARTIDO: Categoria[] = ["vestido", "mono", "tapado"];

/** Puntajes del motor (más alto = se muestra primero). */
export const PUNTAJES = {
  mismoColor: 3,
  combinacionIdeal: 3,
  neutro: 2,
  /** Por debajo de este puntaje de color, no se recomienda. */
  minimoColor: 2,
  estiloCompartido: 1,
  ocasionCompartida: 1,
  destacado: 0.5,
  talleCompatible: 0.5,
};
