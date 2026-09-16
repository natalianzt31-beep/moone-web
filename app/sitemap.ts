import type { MetadataRoute } from "next";
import { CATEGORIAS } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/site";

const PAGINAS_ESTATICAS = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/coleccion", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/sale", changeFrequency: "daily" as const, priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/nosotras", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/privacidad", changeFrequency: "yearly" as const, priority: 0.1 },
  { path: "/terminos", changeFrequency: "yearly" as const, priority: 0.1 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("slug")
    .eq("categoria", "vestido");

  if (error) throw new Error(error.message);

  const slugsVestidos = Array.from(new Set((data ?? []).map((p) => p.slug)));

  return [
    ...PAGINAS_ESTATICAS.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      changeFrequency,
      priority,
    })),
    ...CATEGORIAS.map((categoria) => ({
      url: absoluteUrl(`/coleccion/${categoria.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...slugsVestidos.map((slug) => ({
      url: absoluteUrl(`/vestidos/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
