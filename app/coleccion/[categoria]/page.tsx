import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIAS } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CategoriaClient } from "./CategoriaClient";

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }));
}

const DESCRIPCIONES: Record<string, string> = {
  vestidos:
    "Alquilá vestidos de fiesta en Montevideo: variedad de talles, colores y estilos para casamientos, graduaciones y eventos. Asesoramiento y retiro en Punta Carretas.",
  monos:
    "Alquilá monos de fiesta en Montevideo para tu próximo evento. Variedad de talles y asesoramiento personalizado en Môone, Punta Carretas.",
  sandalias:
    "Alquilá sandalias de fiesta en Montevideo para combinar con tu look. Variedad de talles y estilos, retiro en Punta Carretas.",
  carteras:
    "Alquilá carteras de fiesta en Montevideo para completar tu look. Variedad de estilos, retiro en Punta Carretas.",
  tapados:
    "Alquilá tapados de fiesta en Montevideo para tu próximo evento. Variedad de talles y estilos, retiro en Punta Carretas.",
  accesorios:
    "Alquilá accesorios de fiesta en Montevideo para completar tu look. Retiro en Punta Carretas.",
};

export async function generateMetadata({
  params,
}: PageProps<"/coleccion/[categoria]">): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = CATEGORIAS.find((c) => c.slug === slug);
  if (!categoria) return {};

  const title = `${categoria.label} en alquiler`;
  const description =
    DESCRIPCIONES[categoria.slug] ??
    `Alquilá ${categoria.label.toLowerCase()} para tu próximo evento en Montevideo. Curaduría y asesoramiento en Môone.`;

  return {
    title,
    description,
    alternates: { canonical: `/coleccion/${categoria.slug}` },
    openGraph: { title, description },
  };
}

export default async function CategoriaPage({
  params,
}: PageProps<"/coleccion/[categoria]">) {
  const { categoria: slug } = await params;
  const categoria = CATEGORIAS.find((c) => c.slug === slug);

  if (!categoria) {
    notFound();
  }

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .eq("categoria", categoria.db)
    .eq("estado", "disponible")
    .gt("precio_alquiler", 0)
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);

  return <CategoriaClient key={categoria.slug} categoria={categoria} products={data ?? []} />;
}
