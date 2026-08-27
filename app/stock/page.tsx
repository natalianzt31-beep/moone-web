"use client";

import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { getSupabaseClient } from "@/lib/supabase/client";
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
  disponible: "border border-chocolate text-chocolate",
  reservado: "border border-taupe text-taupe",
  alquilado: "bg-negro text-blanco",
  en_reparacion: "bg-arena text-negro",
  baja_definitiva: "bg-crema text-taupe",
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

      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategoria =
        categoriaFiltro === "todas" || product.categoria === categoriaFiltro;
      const matchesEstado = estadoFiltro === "todos" || product.estado === estadoFiltro;
      return matchesCategoria && matchesEstado;
    });
  }, [products, categoriaFiltro, estadoFiltro]);

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
        <h1 className="text-2xl font-normal tracking-tight text-negro">Stock</h1>
        <p className="mt-1 text-sm text-chocolate">Productos cargados en Supabase.</p>

        <div className="mt-6 flex flex-wrap gap-4 rounded-[3px] bg-arena p-4">
          <label className="flex flex-col gap-1 text-sm text-negro">
            Categoría
            <select
              value={categoriaFiltro}
              onChange={(e) =>
                setCategoriaFiltro(e.target.value as Categoria | "todas")
              }
              className="rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none"
            >
              <option value="todas">Todas</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Estado
            <select
              value={estadoFiltro}
              onChange={(e) =>
                setEstadoFiltro(e.target.value as EstadoProducto | "todos")
              }
              className="rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none"
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

        <div className="mt-6 overflow-x-auto rounded-[3px] border border-arena">
          <table className="min-w-full divide-y divide-arena">
            <thead className="bg-crema">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                  Talle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                  Color
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                  Precio alquiler
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena bg-blanco">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-taupe">
                    Cargando productos...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-chocolate">
                    Error al cargar productos: {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-taupe">
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-sm font-medium text-negro">
                      {product.nombre}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-chocolate">
                      {product.categoria}
                    </td>
                    <td className="px-4 py-3 text-sm text-chocolate">
                      {product.talle ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-chocolate">
                      {product.color ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-negro">
                      {currencyFormatter.format(product.precio_alquiler)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-[3px] px-2.5 py-0.5 text-xs font-medium ${ESTADO_BADGE[product.estado]}`}
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
          <p className="mt-3 text-sm text-taupe">
            {filteredProducts.length} de {products.length} productos
          </p>
        )}
      </div>
    </div>
  );
}
