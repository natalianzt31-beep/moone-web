import type { Categoria } from "@/lib/supabase/types";

// Las fotos de prendas de cuerpo entero (vestidos, monos, tapados) son mucho
// más angostas que las de accesorios (carteras, sandalias) fotografiados de
// frente, y varían bastante entre sí según el largo/vuelo de cada prenda —
// forzarlas a una relación de aspecto idéntica implicaría o recortar parte
// de la prenda (riesgo de cortar cabeza/pies) o rellenarlas con tanto margen
// blanco que se verían como una miniatura flotando en el recuadro. Por eso
// usan un recuadro angosto fijo con object-contain: nunca se recorta nada,
// a costa de algo de margen blanco variable según el vuelo de cada prenda.
//
// Las fotos de accesorios (carteras, sandalias, accesorios) sí son casi
// cuadradas entre sí (ver scripts/normalizar-foto-producto.py), así que ahí
// usamos un recuadro parejo con object-cover: llena el recuadro sin dejar
// margen blanco y el recorte que hace falta es mínimo (nunca corta el
// producto, como mucho un pelo de fondo).
const PRENDAS_CUERPO_ENTERO: Categoria[] = ["vestido", "mono", "tapado"];

export function imageBoxAspectClass(categoria: Categoria): string {
  return PRENDAS_CUERPO_ENTERO.includes(categoria) ? "aspect-[3/8]" : "aspect-[4/5]";
}

export function imageObjectFit(categoria: Categoria): "contain" | "cover" {
  return PRENDAS_CUERPO_ENTERO.includes(categoria) ? "contain" : "cover";
}
