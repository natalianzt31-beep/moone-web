import type { Categoria } from "@/lib/supabase/types";

// Los vestidos ya pasan por scripts/estandarizar-lienzo-vestidos.py antes de
// subirse: ese script escala cada foto (sin recortar la prenda) para que la
// modela quede siempre al mismo alto en píxeles, y la pega centrada sobre un
// lienzo blanco de tamaño FIJO (800x1250, igual para cada foto del
// catálogo). Por eso todas las fotos de vestidos son literalmente idénticas
// en tamaño y proporción — alcanza un recuadro fijo con esa misma relación
// de aspecto (16/25) en cualquier contexto, sin letterboxing ni recorte: el
// recuadro y la foto miden exactamente lo mismo.
//
// Monos y tapados (solo un puñado de fotos hoy) todavía no pasaron por ese
// script — sus fotos varían de proporción entre sí según el vuelo/largo de
// cada prenda. Para esos casos, la grilla del catálogo no las mete en una
// caja de tamaño fijo: las muestra a su relación de aspecto real, todas al
// mismo ANCHO (el de la columna), dejando que cada una tenga el alto que le
// corresponda — como un muro de fotos (estilo Pinterest, vía columns-* en
// vez de grid). Así ninguna se ve "más chica" que otra y nunca se recorta
// nada. La ficha de producto (`variant="ficha"`) sigue usando un recuadro
// fijo con object-contain para estas, porque ahí no compite visualmente con
// otras tarjetas al lado.
//
// Las fotos de accesorios (carteras, sandalias, accesorios) sí son casi
// cuadradas entre sí (ver scripts/normalizar-foto-producto.py), así que en
// todos lados usan un recuadro parejo con object-cover: llena el recuadro
// sin dejar margen blanco y el recorte que hace falta es mínimo (nunca
// corta el producto, como mucho un pelo de fondo).
const PRENDAS_CUERPO_ENTERO: Categoria[] = ["vestido", "mono", "tapado"];
const LIENZO_FIJO: Categoria[] = ["vestido"];

export type ImageVariant = "grid" | "ficha";
export type ImageDisplayMode = "contain" | "cover" | "natural";

export function esPrendaCuerpoEntero(categoria: Categoria): boolean {
  return PRENDAS_CUERPO_ENTERO.includes(categoria);
}

export function imageBoxAspectClass(categoria: Categoria): string {
  if (LIENZO_FIJO.includes(categoria)) return "aspect-[16/25]";
  return esPrendaCuerpoEntero(categoria) ? "aspect-[3/8]" : "aspect-[4/5]";
}

export function imageDisplayMode(categoria: Categoria, variant: ImageVariant): ImageDisplayMode {
  if (LIENZO_FIJO.includes(categoria)) return "contain";
  if (variant === "grid" && esPrendaCuerpoEntero(categoria)) return "natural";
  return esPrendaCuerpoEntero(categoria) ? "contain" : "cover";
}
