"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/supabase/types";

/**
 * Ficha de un producto por SKU, para links directos (ej. una etiqueta con
 * QR en el local). Si quien entra es staff, la redirige derecho a editarlo
 * en /admin/stock; si no, muestra la ficha pública normal (la misma
 * ProductCard que ya se usa en el catálogo).
 */
export default function ProductoPorSkuPage() {
  const params = useParams<{ sku: string }>();
  const router = useRouter();
  const { isStaff, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
          .eq("sku", params.sku)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [params.sku]);

  useEffect(() => {
    if (authLoading || !isStaff) return;
    router.replace(`/admin/stock?sku=${encodeURIComponent(params.sku)}`);
  }, [authLoading, isStaff, params.sku, router]);

  const mostrandoParaStaff = !authLoading && isStaff;

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-sm px-4 py-10 sm:px-8 sm:py-16">
          {(authLoading || loading || mostrandoParaStaff) && (
            <p className="text-sm text-taupe">Cargando...</p>
          )}

          {!authLoading && !loading && !mostrandoParaStaff && (error || !product) && (
            <p className="text-sm text-chocolate">
              No encontramos ninguna prenda con el código {params.sku}
              {error ? `: ${error}` : "."}
            </p>
          )}

          {!authLoading && !loading && !mostrandoParaStaff && product && (
            product.estado === "baja_definitiva" ? (
              <div>
                <p className="text-base font-medium text-negro">{product.nombre}</p>
                <p className="mt-2 text-sm text-chocolate">Esta prenda ya no está disponible.</p>
              </div>
            ) : (
              <ProductCard
                product={product}
                tipo={product.precio_venta != null ? "venta" : "alquiler"}
              />
            )
          )}
        </section>
      </main>
    </div>
  );
}
