"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { compararTalles } from "@/lib/talles";
import { colorPrincipal, compararColoresPrincipales } from "@/lib/colores";
import { ColorFilterHint } from "@/components/ColorFilterHint";
import type { Product } from "@/lib/supabase/types";

const SELECT_CLASSES =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 text-sm text-negro focus:border-chocolate focus:outline-none";

export function CategoriaClient({
  categoria,
  products,
  tipo = "alquiler",
  backHref = "/coleccion",
  backLabel = "Colección",
}: {
  categoria: { label: string };
  products: Product[];
  /** "venta" para subcategorías de En Venta (ej. vestidos en venta) — ver app/coleccion/en-venta/. */
  tipo?: "alquiler" | "venta";
  /** A dónde vuelve el link "←" de arriba — por defecto /coleccion, pero una subcategoría (ej. Accesorios > Cintos) vuelve a su categoría padre. */
  backHref?: string;
  backLabel?: string;
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
      // Vestidos y monos siempre muestran el desplegable de talle, aunque
      // haya una sola unidad: sin grupo_producto, cada uno arma su propio
      // grupo de 1 usando su id.
      const key =
        product.grupo_producto ??
        (product.categoria === "vestido" || product.categoria === "mono" ? product.id : null);

      if (key) {
        const variantes = gruposMap.get(key) ?? [];
        variantes.push(product);
        gruposMap.set(key, variantes);
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
            href={backHref}
            className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← {backLabel}
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
                  autoComplete="off"
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
                <div className="flex items-center gap-1">
                  <select
                    value={colorFiltro}
                    onChange={(e) => setColorFiltro(e.target.value)}
                    className={SELECT_CLASSES}
                    aria-label="Filtrar por color"
                    autoComplete="off"
                  >
                    <option value="">Color</option>
                    {opcionesColor.map((valor) => (
                      <option key={valor} value={valor}>
                        {valor}
                      </option>
                    ))}
                  </select>
                  <ColorFilterHint />
                </div>
              )}

              {opcionesTalle.length > 0 && (
                <select
                  value={talleFiltro}
                  onChange={(e) => setTalleFiltro(e.target.value)}
                  className={SELECT_CLASSES}
                  aria-label="Filtrar por talle"
                  autoComplete="off"
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
                  tipo={tipo}
                  variant="grid"
                  preload={i < 4}
                />
              ))}
              {individuales.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tipo={tipo}
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
