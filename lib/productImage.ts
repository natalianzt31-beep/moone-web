import type { Categoria } from "@/lib/supabase/types";

// Las fotos de prendas de cuerpo entero (vestidos, monos, tapados) son mucho
// más angostas que las de accesorios (carteras, sandalias) fotografiados de
// frente. Usamos una proporción de recuadro distinta para cada grupo para
// que el object-contain deje el mínimo margen blanco posible en cada caso.
const PRENDAS_CUERPO_ENTERO: Categoria[] = ["vestido", "mono", "tapado"];

export function imageBoxAspectClass(categoria: Categoria): string {
  return PRENDAS_CUERPO_ENTERO.includes(categoria) ? "aspect-[2/5]" : "aspect-[4/5]";
}
