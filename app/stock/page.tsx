"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Categoria, EstadoProducto, Product } from "@/lib/supabase/types";

const CATEGORIAS: Categoria[] = ["vestido", "sandalias", "cartera"];
const ESTADOS: EstadoProducto[] = [
  "disponible",
  "reservado",
  "alquilado",
  "en_reparacion",
  "baja_definitiva",
];

const ESTADO_LABEL: Record<EstadoProducto, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  alquilado: "Alquilado",
  en_reparacion: "En reparación",
  baja_definitiva: "Baja definitiva",
};

const ESTADO_BADGE: Record<EstadoProducto, string> = {
  disponible: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  reservado: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  alquilado: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  en_reparacion: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  baja_definitiva: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | "todas">("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoProducto | "todos">("todos");

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("nombre", { ascending: true });

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategoria =
        categoriaFiltro === "todas" || product.categoria === categoriaFiltro;
      const matchesEstado = estadoFiltro === "todos" || product.estado === estadoFiltro;
      return matchesCategoria && matchesEstado;
    });
  }, [products, categoriaFiltro, estadoFiltro]);

  return (
    <div className="min-h-full bg-zinc-50 px-4 py-10 dark:bg-black sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stock
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Productos cargados en Supabase.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Categoría
            <select
              value={categoriaFiltro}
              onChange={(e) =>
                setCategoriaFiltro(e.target.value as Categoria | "todas")
              }
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="todas">Todas</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Estado
            <select
              value={estadoFiltro}
              onChange={(e) =>
                setEstadoFiltro(e.target.value as EstadoProducto | "todos")
              }
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="todos">Todos</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABEL[estado]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Talle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Color
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Precio alquiler
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Cargando productos...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-400"
                  >
                    Error al cargar productos: {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {product.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-zinc-700 dark:text-zinc-300">
                      {product.categoria}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {product.talle ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {product.color ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {currencyFormatter.format(product.precio_alquiler)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_BADGE[product.estado]}`}
                      >
                        {ESTADO_LABEL[product.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {filteredProducts.length} de {products.length} productos
          </p>
        )}
      </div>
    </div>
  );
}
