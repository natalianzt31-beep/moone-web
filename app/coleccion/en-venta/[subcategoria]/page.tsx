import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EN_VENTA_SUBCATEGORIAS } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { CategoriaClient } from "../../[categoria]/CategoriaClient";

export const revalidate = 3600;

export function generateStaticParams() {
  return EN_VENTA_SUBCATEGORIAS.map((s) => ({ subcategoria: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/coleccion/en-venta/[subcategoria]">): Promise<Metadata> {
  const { subcategoria: slug } = await params;
  const subcategoria = EN_VENTA_SUBCATEGORIAS.find((s) => s.slug === slug);
  if (!subcategoria) return {};

  const title = subcategoria.label;
  const description = `${subcategoria.label} en Môone, Montevideo: venta definitiva, se abona al 100%. Retiro en Punta Carretas.`;

  return {
    title,
    description,
    alternates: { canonical: `/coleccion/en-venta/${subcategoria.slug}` },
    openGraph: { title, description },
  };
}

export default async function EnVentaSubcategoriaPage({
  params,
}: PageProps<"/coleccion/en-venta/[subcategoria]">) {
  const { subcategoria: slug } = await params;
  const subcategoria = EN_VENTA_SUBCATEGORIAS.find((s) => s.slug === slug);

  if (!subcategoria) {
    notFound();
  }

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .eq("categoria", subcategoria.db)
    .not("precio_venta", "is", null)
    .neq("estado", "baja_definitiva")
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Colección", item: absoluteUrl("/coleccion") },
      {
        "@type": "ListItem",
        position: 3,
        name: "En Venta",
        item: absoluteUrl("/coleccion/en-venta"),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: subcategoria.label,
        item: absoluteUrl(`/coleccion/en-venta/${subcategoria.slug}`),
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <CategoriaClient
        key={subcategoria.slug}
        categoria={subcategoria}
        products={data ?? []}
        tipo="venta"
        backHref="/coleccion/en-venta"
        backLabel="En Venta"
      />
    </>
  );
}
