import { permanentRedirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ProductoClient } from "./ProductoClient";

export default async function ProductoPorSkuPage({
  params,
}: PageProps<"/p/[sku]">) {
  const { sku } = await params;

  const { data: product } = await getSupabaseClient()
    .from("products")
    .select("categoria, slug")
    .eq("sku", sku)
    .maybeSingle();

  // Los vestidos ya tienen su URL linda en /vestidos/[slug]: mandamos para
  // allá con un 308 (redirect permanente) para no perder el SEO de estas
  // etiquetas viejas. El sku queda como query param para que, si quien
  // escaneó la etiqueta física es staff, lo mandemos directo a editar ese
  // producto puntual (ver VestidoDetailClient).
  if (product?.categoria === "vestido" && product.slug) {
    permanentRedirect(`/vestidos/${product.slug}?sku=${encodeURIComponent(sku)}`);
  }

  return <ProductoClient sku={sku} />;
}
