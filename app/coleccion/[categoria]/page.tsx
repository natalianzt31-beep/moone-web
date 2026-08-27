"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CATEGORIAS } from "@/lib/site-config";
import type { Product } from "@/lib/supabase/types";

export default function CategoriaPage() {
  const params = useParams<{ categoria: string }>();
  const categoria = CATEGORIAS.find((c) => c.slug === params.categoria);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoria) return;
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
          .eq("categoria", categoria!.db)
          .eq("estado", "disponible")
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
  }, [categoria]);

  if (!categoria) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <Link
            href="/coleccion"
            className="text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← Colección
          </Link>
          <h1 className="mt-2 text-2xl font-normal tracking-tight text-negro">
            {categoria.label}
          </h1>

          {loading && <p className="mt-8 text-sm text-taupe">Cargando piezas...</p>}

          {!loading && error && (
            <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="mt-8 text-sm text-taupe">
              No hay piezas disponibles en esta categoría por el momento.
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} tipo="alquiler" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
