"use client";

import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { getSupabaseClient } from "@/lib/supabase/client";
import { compararTalles } from "@/lib/talles";
import type { Product } from "@/lib/supabase/types";

const SELECT_CLASSES =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 text-sm text-negro focus:border-chocolate focus:outline-none";

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [colorFiltro, setColorFiltro] = useState("");
  const [talleFiltro, setTalleFiltro] = useState("");

  const opcionesColor = useMemo(
    () => Array.from(new Set(products.map((p) => p.color).filter((v): v is string => !!v))).sort(),
    [products],
  );
  const opcionesTalle = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.talle).filter((v): v is string => !!v))).sort(
        compararTalles
      ),
    [products],
  );

  const productosFiltrados = useMemo(
    () =>
      products.filter(
        (p) => (!colorFiltro || p.color === colorFiltro) && (!talleFiltro || p.talle === talleFiltro),
      ),
    [products, colorFiltro, talleFiltro],
  );

  const hayFiltrosActivos = !!(colorFiltro || talleFiltro);

  const { grupos, individuales } = useMemo(() => {
    const gruposMap = new Map<string, Product[]>();
    const individuales: Product[] = [];

    for (const product of productosFiltrados) {
      if (product.grupo_producto) {
        const variantes = gruposMap.get(product.grupo_producto) ?? [];
        variantes.push(product);
        gruposMap.set(product.grupo_producto, variantes);
      } else {
        individuales.push(product);
      }
    }

    const grupos = Array.from(gruposMap.entries()).map(([key, variantes]) => ({
      key,
      variantes,
    }));

    return { grupos, individuales };
  }, [productosFiltrados]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
          .not("precio_venta", "is", null)
          .neq("estado", "baja_definitiva")
          .order("nombre", { ascending: true });

        if (cancelled) return;

        if (error) {
          setError(error.message);
        } else {
          setProducts((data ?? []) as Product[]);
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
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            On Sale
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Prendas en venta definitiva — se abonan al 100%, no se alquilan.
          </p>

          {!loading && !error && products.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              {opcionesColor.length > 0 && (
                <select
                  value={colorFiltro}
                  onChange={(e) => setColorFiltro(e.target.value)}
                  className={SELECT_CLASSES}
                  aria-label="Filtrar por color"
                >
                  <option value="">Color</option>
                  {opcionesColor.map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </select>
              )}

              {opcionesTalle.length > 0 && (
                <select
                  value={talleFiltro}
                  onChange={(e) => setTalleFiltro(e.target.value)}
                  className={SELECT_CLASSES}
                  aria-label="Filtrar por talle"
                >
                  <option value="">Talle</option>
                  {opcionesTalle.map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </select>
              )}

              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={() => {
                    setColorFiltro("");
                    setTalleFiltro("");
                  }}
                  className="flex min-h-11 items-center text-xs uppercase tracking-wider text-taupe underline-offset-2 transition-colors hover:text-chocolate hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {loading && <p className="mt-8 text-sm text-taupe">Cargando piezas...</p>}

          {!loading && error && (
            <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="mt-8 text-sm text-taupe">
              No hay prendas en venta por el momento.
            </p>
          )}

          {!loading && !error && products.length > 0 && productosFiltrados.length === 0 && (
            <p className="mt-8 text-sm text-taupe">
              No hay prendas que coincidan con esos filtros.
            </p>
          )}

          {!loading && !error && productosFiltrados.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {grupos.map(({ key, variantes }) => (
                <GroupedProductCard key={key} variantes={variantes} tipo="venta" />
              ))}
              {individuales.map((product) => (
                <ProductCard key={product.id} product={product} tipo="venta" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
