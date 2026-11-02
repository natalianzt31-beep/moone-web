import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ACCESORIOS_SUBCATEGORIAS } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { CategoriaClient } from "../../[categoria]/CategoriaClient";

export const revalidate = 3600;

export function generateStaticParams() {
  return ACCESORIOS_SUBCATEGORIAS.map((s) => ({ subcategoria: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/coleccion/accesorios/[subcategoria]">): Promise<Metadata> {
  const { subcategoria: slug } = await params;
  const subcategoria = ACCESORIOS_SUBCATEGORIAS.find((s) => s.slug === slug);
  if (!subcategoria) return {};

  const title = `${subcategoria.label} en alquiler`;
  const description = `Alquilá ${subcategoria.label.toLowerCase()} en Montevideo para completar tu look. Retiro en Punta Carretas.`;

  return {
    title,
    description,
    alternates: { canonical: `/coleccion/accesorios/${subcategoria.slug}` },
    openGraph: { title, description },
  };
}

export default async function AccesoriosSubcategoriaPage({
  params,
}: PageProps<"/coleccion/accesorios/[subcategoria]">) {
  const { subcategoria: slug } = await params;
  const subcategoria = ACCESORIOS_SUBCATEGORIAS.find((s) => s.slug === slug);

  if (!subcategoria) {
    notFound();
  }

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .eq("categoria", subcategoria.db)
    .eq("estado", "disponible")
    .gt("precio_alquiler", 0)
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
        name: "Accesorios",
        item: absoluteUrl("/coleccion/accesorios"),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: subcategoria.label,
        item: absoluteUrl(`/coleccion/accesorios/${subcategoria.slug}`),
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
        backHref="/coleccion/accesorios"
        backLabel="Accesorios"
      />
    </>
  );
}
