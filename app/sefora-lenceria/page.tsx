import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/site";
import { MARCA_SEFORA } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";
import { CategoriaClient } from "../coleccion/[categoria]/CategoriaClient";
import type { Product } from "@/lib/supabase/types";

export const revalidate = 3600;

// Columnas explícitas (no "*"): la página se renderiza para el público y no
// tiene por qué viajar al navegador nada interno de la tabla.
const CAMPOS =
  "id, sku, nombre, categoria, talle, color, largo_tipo, descripcion_web, grupo_producto, precio_alquiler, valor_reposicion, estado, slug, foto_url, fotos, precio_venta, precio_venta_original, condicion, marca, coleccion, created_at";

const TITULO = "Séfora Lencería";
const DESCRIPCION =
  "Lencería, bodies y trajes de baño de Séfora Lencería en Môone, Montevideo. Venta definitiva, retiro en Punta Carretas.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/sefora-lenceria" },
  openGraph: { title: TITULO, description: DESCRIPCION },
};

export default async function SeforaLenceriaPage() {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(CAMPOS)
    .eq("marca", MARCA_SEFORA)
    .not("precio_venta", "is", null)
    .neq("estado", "baja_definitiva")
    .order("nombre", { ascending: true })
    .returns<Product[]>();

  if (error) throw new Error(error.message);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: TITULO,
        item: absoluteUrl("/sefora-lenceria"),
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <CategoriaClient
        categoria={{ label: TITULO }}
        products={data ?? []}
        tipo="venta"
        backHref="/"
        backLabel="Inicio"
      />
    </>
  );
}
