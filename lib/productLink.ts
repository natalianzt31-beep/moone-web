import type { Product } from "@/lib/supabase/types";

/**
 * URL canónica de la ficha pública de un producto. Los vestidos tienen su
 * propia URL linda por slug (agrupa todos los talles en una sola página);
 * el resto de las categorías usa /p/[sku].
 */
export function productHref(product: Pick<Product, "categoria" | "slug" | "sku">): string {
  return product.categoria === "vestido" ? `/vestidos/${product.slug}` : `/p/${product.sku}`;
}
