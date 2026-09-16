import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase/client";
import { compararTalles } from "@/lib/talles";
import { absoluteUrl } from "@/lib/site";
import type { Product } from "@/lib/supabase/types";
import { VestidoDetailClient } from "./VestidoDetailClient";

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

  const title = `${producto.nombre} – Alquiler`;
  const detalles = [
    producto.color ? `color ${producto.color.toLowerCase()}` : null,
    producto.largo_tipo ? `largo ${producto.largo_tipo.toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const description =
    `Alquilá "${producto.nombre}"${detalles ? ` (${detalles})` : ""} en Montevideo` +
    `${talles.length > 0 ? `. Talles disponibles: ${talles.join(", ")}` : ""}.` +
    ` Ideal para casamientos, graduaciones y fiestas. Retiro en Punta Carretas.`;

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

  return <VestidoDetailClient variantes={variantes} />;
}
