"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/supabase/types";

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
          .eq("en_venta", true)
          .neq("estado", "baja_definitiva")
          .order("nombre", { ascending: true });

        if (cancelled) return;

        if (error) {
          setError(error.message);
        } else {
          setProducts(data ?? []);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h1 className="text-2xl font-normal tracking-tight text-negro">
            On Sale
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Prendas en venta definitiva — se abonan al 100%, no se alquilan.
          </p>

          {loading && <p className="mt-8 text-sm text-taupe">Cargando piezas...</p>}

          {!loading && error && (
            <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="mt-8 text-sm text-taupe">
              No hay prendas en venta por el momento.
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} tipo="venta" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
