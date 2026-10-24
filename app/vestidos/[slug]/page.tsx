import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase/client";
import { compararTalles } from "@/lib/talles";
import { absoluteUrl } from "@/lib/site";
import type { Product } from "@/lib/supabase/types";
import { JsonLd } from "@/components/JsonLd";
import { VestidoDetailClient } from "./VestidoDetailClient";

function nombreSinTalle(nombre: string) {
  return nombre.replace(/\s*talle\s*\S+\s*$/i, "").trim();
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("slug")
    .eq("categoria", "vestido");

  if (error) throw new Error(error.message);

  const slugs = Array.from(new Set((data ?? []).map((p) => p.slug)));
  return slugs.map((slug) => ({ slug }));
}

async function getVariantes(slug: string): Promise<Product[]> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .eq("categoria", "vestido")
    .eq("slug", slug);

  if (error) throw new Error(error.message);

  return (data ?? []).filter((p) => p.estado !== "baja_definitiva");
}

export async function generateMetadata({
  params,
}: PageProps<"/vestidos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const variantes = await getVariantes(slug);
  if (variantes.length === 0) return {};

  const producto = variantes[0];
  const talles = Array.from(new Set(variantes.map((p) => p.talle).filter((v): v is string => !!v))).sort(
    compararTalles
  );
  // precio_alquiler es 0 (no null) en los vestidos que son solo venta definitiva.
  const esAlquiler = producto.precio_alquiler > 0;

  const title = `${producto.nombre} – ${esAlquiler ? "Alquiler" : "Venta"}`;
  const detalles = [
    producto.color ? `color ${producto.color.toLowerCase()}` : null,
    producto.largo_tipo ? `largo ${producto.largo_tipo.toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const description = esAlquiler
    ? `Alquilá "${producto.nombre}"${detalles ? ` (${detalles})` : ""} en Montevideo` +
      `${talles.length > 0 ? `. Talles disponibles: ${talles.join(", ")}` : ""}.` +
      ` Ideal para casamientos, graduaciones y fiestas. Retiro en Punta Carretas.`
    : `Comprá "${producto.nombre}"${detalles ? ` (${detalles})` : ""} en Montevideo` +
      `${talles.length > 0 ? `. Talles disponibles: ${talles.join(", ")}` : ""}.` +
      ` Venta definitiva. Retiro en Punta Carretas.`;

  const foto = producto.fotos?.[0] ?? producto.foto_url ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/vestidos/${slug}` },
    openGraph: {
      title,
      description,
      images: foto ? [{ url: absoluteUrl(foto) }] : undefined,
    },
  };
}

export default async function VestidoPage({
  params,
}: PageProps<"/vestidos/[slug]">) {
  const { slug } = await params;
  const variantes = await getVariantes(slug);

  if (variantes.length === 0) {
    notFound();
  }

  const producto = variantes[0];
  const nombreBase = nombreSinTalle(producto.nombre);
  const foto = producto.fotos?.[0] ?? producto.foto_url ?? undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: nombreBase,
    description: producto.descripcion_web ?? undefined,
    image: foto ? absoluteUrl(foto) : undefined,
    category: "Vestido de fiesta",
    ...(producto.precio_alquiler > 0 || producto.precio_venta != null
      ? {
          offers: {
            "@type": "Offer",
            price: producto.precio_alquiler > 0 ? producto.precio_alquiler : producto.precio_venta,
            priceCurrency: "UYU",
            availability: variantes.some((p) => p.estado === "disponible")
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: absoluteUrl(`/vestidos/${slug}`),
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Vestidos", item: absoluteUrl("/coleccion/vestidos") },
      { "@type": "ListItem", position: 3, name: nombreBase, item: absoluteUrl(`/vestidos/${slug}`) },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <VestidoDetailClient variantes={variantes} />
    </>
  );
}
