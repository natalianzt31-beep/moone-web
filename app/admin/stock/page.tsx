"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import type { Categoria, EstadoProducto, Product } from "@/lib/supabase/types";

const CATEGORIAS: Categoria[] = ["vestido", "mono", "sandalias", "cartera", "tapado"];
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

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const emptyForm = {
  sku: "",
  nombre: "",
  categoria: "vestido" as Categoria,
  talle: "",
  color: "",
  precio_alquiler: "",
  valor_reposicion: "",
  foto_url: "",
  en_venta: false,
  precio_venta: "",
};

function StockContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | "todas">("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoProducto | "todos">("todos");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getSupabaseClient()
        .from("products")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategoria =
        categoriaFiltro === "todas" || product.categoria === categoriaFiltro;
      const matchesEstado = estadoFiltro === "todos" || product.estado === estadoFiltro;
      return matchesCategoria && matchesEstado;
    });
  }, [products, categoriaFiltro, estadoFiltro]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.sku || !form.nombre || !form.precio_alquiler) {
      setFormError("SKU, nombre y precio de alquiler son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await getSupabaseClient().from("products").insert({
        sku: form.sku,
        nombre: form.nombre,
        categoria: form.categoria,
        talle: form.talle || null,
        color: form.color || null,
        precio_alquiler: Number(form.precio_alquiler),
        valor_reposicion: form.valor_reposicion ? Number(form.valor_reposicion) : null,
        foto_url: form.foto_url || null,
        en_venta: form.en_venta,
        precio_venta: form.en_venta && form.precio_venta ? Number(form.precio_venta) : null,
      });

      if (error) {
        setFormError(
          error.code === "23505" ? "Ya existe un producto con ese SKU." : error.message
        );
        return;
      }

      setForm(emptyForm);
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleEstadoChange(product: Product, nuevoEstado: EstadoProducto) {
    setUpdatingId(product.id);
    try {
      const { error } = await getSupabaseClient()
        .from("products")
        .update({ estado: nuevoEstado })
        .eq("id", product.id);

      if (error) {
        setError(error.message);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, estado: nuevoEstado } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">Stock</h1>
          <p className="mt-1 text-sm text-chocolate">Alta, baja y listado de productos.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
        >
          {showForm ? "Cancelar" : "+ Nuevo producto"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 rounded-[3px] border border-arena bg-blanco p-4 sm:grid-cols-2 sm:p-6"
        >
          <label className="flex flex-col gap-1 text-sm text-negro">
            SKU
            <input
              type="text"
              required
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Nombre
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Categoría
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoria: e.target.value as Categoria }))
              }
              className={inputClass}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Talle
            <input
              type="text"
              value={form.talle}
              onChange={(e) => setForm((f) => ({ ...f, talle: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Color
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Precio alquiler
            <input
              type="number"
              min="0"
              required
              value={form.precio_alquiler}
              onChange={(e) => setForm((f) => ({ ...f, precio_alquiler: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Valor de reposición
            <input
              type="number"
              min="0"
              value={form.valor_reposicion}
              onChange={(e) => setForm((f) => ({ ...f, valor_reposicion: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-negro">
            Foto (URL)
            <input
              type="text"
              value={form.foto_url}
              onChange={(e) => setForm((f) => ({ ...f, foto_url: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex min-h-11 items-center gap-2 text-sm text-negro">
            <input
              type="checkbox"
              checked={form.en_venta}
              onChange={(e) => setForm((f) => ({ ...f, en_venta: e.target.checked }))}
              className="h-5 w-5"
            />
            En venta (On Sale)
          </label>

          {form.en_venta && (
            <label className="flex flex-col gap-1 text-sm text-negro">
              Precio de venta
              <input
                type="number"
                min="0"
                value={form.precio_venta}
                onChange={(e) => setForm((f) => ({ ...f, precio_venta: e.target.value }))}
                className={inputClass}
              />
            </label>
          )}

          {formError && <p className="text-sm text-chocolate sm:col-span-2">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60 sm:col-span-2"
          >
            {saving ? "Guardando..." : "Crear producto"}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-4 rounded-[3px] bg-arena p-4 sm:flex-row sm:flex-wrap">
        <label className="flex flex-1 flex-col gap-1 text-sm text-negro sm:flex-none">
          Categoría
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value as Categoria | "todas")}
            className={inputClass}
          >
            <option value="todas">Todas</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm text-negro sm:flex-none">
          Estado
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value as EstadoProducto | "todos")}
            className={inputClass}
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
              {["Nombre", "Categoría", "Talle", "Color", "Precio alquiler", "Estado", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-arena bg-blanco">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-taupe">
                  Cargando productos...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-chocolate">
                  Error al cargar productos: {error}
                </td>
              </tr>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-taupe">
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
                    {product.en_venta && (
                      <span className="ml-2 text-xs uppercase tracking-wider text-taupe">
                        Sale
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize text-chocolate">
                    {product.categoria}
                  </td>
                  <td className="px-4 py-3 text-sm text-chocolate">{product.talle ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-chocolate">{product.color ?? "—"}</td>
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
                  <td className="px-4 py-3 text-sm">
                    {product.estado === "baja_definitiva" ? (
                      <button
                        type="button"
                        disabled={updatingId === product.id}
                        onClick={() => handleEstadoChange(product, "disponible")}
                        className="flex min-h-11 items-center rounded-[3px] border border-arena px-3 text-xs uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60"
                      >
                        Reactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={updatingId === product.id}
                        onClick={() => handleEstadoChange(product, "baja_definitiva")}
                        className="flex min-h-11 items-center rounded-[3px] border border-arena px-3 text-xs uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60"
                      >
                        Dar de baja
                      </button>
                    )}
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
  );
}

export default function AdminStockPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <StockContent />
        </main>
      </RequireStaff>
    </div>
  );
}
