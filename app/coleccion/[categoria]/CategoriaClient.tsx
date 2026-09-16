"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { compararTalles } from "@/lib/talles";
import { colorPrincipal, compararColoresPrincipales } from "@/lib/colores";
import type { Product } from "@/lib/supabase/types";
import type { CATEGORIAS } from "@/lib/site-config";

const SELECT_CLASSES =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 text-sm text-negro focus:border-chocolate focus:outline-none";

type Categoria = (typeof CATEGORIAS)[number];

export function CategoriaClient({
  categoria,
  products,
}: {
  categoria: Categoria;
  products: Product[];
}) {
  const [largoFiltro, setLargoFiltro] = useState("");
  const [colorFiltro, setColorFiltro] = useState("");
  const [talleFiltro, setTalleFiltro] = useState("");

  const opcionesLargo = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.largo_tipo).filter((v): v is string => !!v))).sort(),
    [products],
  );
  const opcionesColor = useMemo(
    () =>
      Array.from(
        new Set(
          products.map((p) => p.color).filter((v): v is string => !!v).map(colorPrincipal),
        ),
      ).sort(compararColoresPrincipales),
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
        (p) =>
          (!largoFiltro || p.largo_tipo === largoFiltro) &&
          (!colorFiltro || (p.color && colorPrincipal(p.color) === colorFiltro)) &&
          (!talleFiltro || p.talle === talleFiltro),
      ),
    [products, largoFiltro, colorFiltro, talleFiltro],
  );

  const hayFiltrosActivos = !!(largoFiltro || colorFiltro || talleFiltro);

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

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
          <Link
            href="/coleccion"
            className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← Colección
          </Link>
          <h1 className="mt-1 text-xl font-normal tracking-tight text-negro sm:text-2xl">
            {categoria.label}
          </h1>

          {products.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              {opcionesLargo.length > 0 && (
                <select
                  value={largoFiltro}
                  onChange={(e) => setLargoFiltro(e.target.value)}
                  className={SELECT_CLASSES}
                  aria-label="Filtrar por largo"
                >
                  <option value="">Corto o largo</option>
                  {opcionesLargo.map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </select>
              )}

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
                    setLargoFiltro("");
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

          {products.length === 0 && (
            <p className="mt-8 text-sm text-taupe">
              No hay piezas disponibles en esta categoría por el momento.
            </p>
          )}

          {products.length > 0 && productosFiltrados.length === 0 && (
            <p className="mt-8 text-sm text-taupe">
              No hay piezas que coincidan con esos filtros.
            </p>
          )}

          {productosFiltrados.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {grupos.map(({ key, variantes }, i) => (
                <GroupedProductCard
                  key={key}
                  variantes={variantes}
                  tipo="alquiler"
                  variant="grid"
                  preload={i < 4}
                />
              ))}
              {individuales.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tipo="alquiler"
                  variant="grid"
                  preload={grupos.length + i < 4}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
