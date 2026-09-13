import type { Categoria } from "@/lib/supabase/types";

// Las fotos de prendas de cuerpo entero (vestidos, monos, tapados) varían
// muchísimo de ancho entre sí según el vuelo/largo de cada prenda — medido
// sobre el catálogo real, la relación ancho/alto va de 0.23 (vestidos tipo
// sirena, muy angostos) a 0.75 (vestidos con falda amplia tipo A). Esa
// franja es demasiado amplia para meterla en un recuadro de proporción fija:
// con object-contain, un recuadro que le queda bien a un vestido angosto le
// deja un margen blanco enorme a uno de falda amplia (se ve "chico"); con
// object-cover, CUALQUIER recuadro fijo termina recortando cabeza o pies en
// la mayoría de las fotos (lo medimos: a un recuadro de compromiso, más de
// la mitad de las fotos necesitarían recortar 20–38% del alto). Ninguna de
// las dos side es un problema técnico, es que las prendas mismas no son
// todas igual de anchas.
//
// Por eso el catálogo (grilla) NO mete estas fotos en una caja de tamaño
// fijo: las muestra a su relación de aspecto real, todas al mismo ANCHO
// (el de la columna de la grilla), dejando que cada una tenga el alto que
// le corresponda — como un muro de fotos (estilo Pinterest). Así ninguna
// foto se ve "más chica" que otra (todas llenan el 100% del ancho de su
// tarjeta) y nunca se recorta nada. La ficha de producto (`variant="ficha"`)
// sigue usando el recuadro fijo con object-contain, porque ahí no hay que
// competir visualmente con otras tarjetas al lado.
//
// Las fotos de accesorios (carteras, sandalias, accesorios) sí son casi
// cuadradas entre sí (ver scripts/normalizar-foto-producto.py), así que en
// todos lados usan un recuadro parejo con object-cover: llena el recuadro
// sin dejar margen blanco y el recorte que hace falta es mínimo (nunca
// corta el producto, como mucho un pelo de fondo).
const PRENDAS_CUERPO_ENTERO: Categoria[] = ["vestido", "mono", "tapado"];

export type ImageVariant = "grid" | "ficha";
export type ImageDisplayMode = "contain" | "cover" | "natural";

export function esPrendaCuerpoEntero(categoria: Categoria): boolean {
  return PRENDAS_CUERPO_ENTERO.includes(categoria);
}

export function imageBoxAspectClass(categoria: Categoria): string {
  return esPrendaCuerpoEntero(categoria) ? "aspect-[3/8]" : "aspect-[4/5]";
}

export function imageDisplayMode(categoria: Categoria, variant: ImageVariant): ImageDisplayMode {
  if (variant === "grid" && esPrendaCuerpoEntero(categoria)) return "natural";
  return esPrendaCuerpoEntero(categoria) ? "contain" : "cover";
}
