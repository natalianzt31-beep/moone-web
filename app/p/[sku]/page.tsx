import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/site";
import { ProductoClient } from "./ProductoClient";

async function getProducto(sku: string) {
  const { data } = await getSupabaseClient()
    .from("products")
    .select("categoria, slug, nombre, color, talle, descripcion_web, fotos, foto_url, estado")
    .eq("sku", sku)
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: PageProps<"/p/[sku]">): Promise<Metadata> {
  const { sku } = await params;
  const product = await getProducto(sku);
  if (!product || product.estado === "baja_definitiva") return {};

  const detalles = [product.color, product.talle ? `talle ${product.talle}` : null]
    .filter(Boolean)
    .join(", ");
  const title = `${product.nombre}${detalles ? ` – ${detalles}` : ""}`;
  const description =
    product.descripcion_web ?? `Conocé "${product.nombre}" en Môone Rental Boutique, Montevideo.`;
  const foto = product.fotos?.[0] ?? product.foto_url ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/p/${sku}` },
    openGraph: {
      title,
      description,
      images: foto ? [{ url: absoluteUrl(foto) }] : undefined,
    },
  };
}

export default async function ProductoPorSkuPage({
  params,
}: PageProps<"/p/[sku]">) {
  const { sku } = await params;
  const product = await getProducto(sku);

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
