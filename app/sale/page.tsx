import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SaleClient } from "./SaleClient";
import type { Product } from "@/lib/supabase/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "En Venta",
  description:
    "Prendas de fiesta en venta definitiva en Môone, Montevideo: vestidos, monos, sandalias y más a precio de liquidación.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage() {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .not("precio_venta", "is", null)
    .neq("estado", "baja_definitiva")
    .order("nombre", { ascending: true })
    .returns<Product[]>();

  if (error) throw new Error(error.message);

  return <SaleClient products={data ?? []} />;
}
