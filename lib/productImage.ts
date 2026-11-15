import type { Categoria } from "@/lib/supabase/types";

// Los vestidos ya pasan por scripts/estandarizar-lienzo-vestidos.py antes de
// subirse: ese script escala cada foto (sin recortar la prenda) para que la
// modela quede al mismo alto en píxeles en TODAS las fotos, y la pega
// centrada sobre un lienzo blanco de tamaño FIJO (700x1250, igual para cada
// foto del catálogo). Por eso todas las fotos de vestidos son literalmente
// idénticas en tamaño y proporción — alcanza un recuadro fijo con esa misma
// relación de aspecto (14/25) en cualquier contexto, sin letterboxing ni
// recorte: el recuadro y la foto miden exactamente lo mismo.
// (El ancho de lienzo 700 se eligió porque el 96% del catálogo tiene un
// vuelo de prenda de 214 a 494px a esa altura estándar — un lienzo pensado
// para las pocas polleras muy amplias dejaba a la enorme mayoría como una
// "banda angosta" perdida en un rectángulo blanco gigante. Las pocas fotos
// cuyo vuelo no entra ni con esto se resuelven en el propio script achicando
// la modela un poco en esa foto puntual, nunca recortándole la prenda.)
//
// Usan object-cover (no object-contain) anclado arriba (object-top): como
// el recuadro coincide exactamente con el tamaño del lienzo, cover no
// recorta nada hoy — pero si alguna vez se sube una foto que no pasó por el
// script y su proporción no coincide exacto, ancla por arriba (cabeza) en
// vez de recortar parejo arriba y abajo, achicando el margen de error.
//
// Monos y tapados (solo un puñado de fotos hoy) todavía no pasaron por ese
// script — sus fotos varían de proporción entre sí según el vuelo/largo de
// cada prenda.
//
// Monos: en la grilla no se meten en una caja de tamaño fijo, se muestran a
// su relación de aspecto real, todas al mismo ANCHO (el de la columna),
// dejando que cada una tenga el alto que le corresponda — como un muro de
// fotos (estilo Pinterest). Así ninguna se ve "más chica" que otra y nunca
// se recorta nada.
//
// Tapados: acá la variación de proporción es mucho más marcada (desde
// capas angostas y muy largas hasta sacos cortos y anchos), así que dejar
// cada foto a su alto real hacía que una tarjeta se viera varias veces más
// alta que la de al lado. Para que todas las tarjetas midan lo mismo, la
// grilla también les da un recuadro fijo con object-contain (sin recortar
// la prenda, con el margen blanco que haga falta) — el mismo tratamiento
// que ya usaba su ficha de producto.
//
// Las fotos de accesorios (carteras, sandalias, accesorios) sí son casi
// cuadradas entre sí (ver scripts/normalizar-foto-producto.py), así que en
// todos lados usan un recuadro parejo con object-cover: llena el recuadro
// sin dejar margen blanco y el recorte que hace falta es mínimo (nunca
// corta el producto, como mucho un pelo de fondo).
const PRENDAS_CUERPO_ENTERO: Categoria[] = ["vestido", "mono", "tapado"];
const LIENZO_FIJO: Categoria[] = ["vestido"];
/** Cuerpo entero que además usa recuadro fijo en grilla (no "muro de fotos"). */
const GRID_CAJA_FIJA: Categoria[] = ["tapado"];

export type ImageVariant = "grid" | "ficha";
export type ImageDisplayMode = "contain" | "cover" | "cover-top" | "natural";

export function esPrendaCuerpoEntero(categoria: Categoria): boolean {
  return PRENDAS_CUERPO_ENTERO.includes(categoria);
}

export function imageBoxAspectClass(categoria: Categoria): string {
  if (LIENZO_FIJO.includes(categoria)) return "aspect-[14/25]";
  return esPrendaCuerpoEntero(categoria) ? "aspect-[3/8]" : "aspect-[4/5]";
}

export function imageDisplayMode(categoria: Categoria, variant: ImageVariant): ImageDisplayMode {
  if (LIENZO_FIJO.includes(categoria)) return "cover-top";
  if (variant === "grid" && esPrendaCuerpoEntero(categoria) && !GRID_CAJA_FIJA.includes(categoria))
    return "natural";
  return esPrendaCuerpoEntero(categoria) ? "contain" : "cover";
}
