"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { ROLES_ADMIN_CAJA } from "@/lib/adminAccess";
import { QrScannerModal } from "@/components/QrScannerModal";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/supabase/types";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const ESTADO_LABEL: Record<string, string> = {
  reservado: "Reservado",
  confirmado_retiro: "Confirmado para retiro",
  retirado: "Retirado",
  en_limpieza: "En limpieza",
  devuelto: "Devuelto",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

function fotoPrincipal(p: { fotos?: string[] | null; foto_url?: string | null } | null | undefined) {
  return p?.fotos?.[0] ?? p?.foto_url ?? null;
}

/** "2026-11-27" -> "27/11/26" */
function formatFechaCorta(iso: string): string {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio.slice(2)}`;
}

/** Etiqueta las etiquetas codifican la URL de la ficha pública del producto. */
function skuDesdeTextoEscaneado(texto: string): string {
  const limpio = texto.trim();
  try {
    const url = new URL(limpio);
    const segmentos = url.pathname.split("/").filter(Boolean);
    if (segmentos.length > 0) return segmentos[segmentos.length - 1].toUpperCase();
  } catch {
    // No es una URL completa: seguimos con el texto tal cual.
  }
  return limpio.toUpperCase();
}

type ReservaDelProducto = {
  id: string;
  numero_pedido: number | null;
  fecha_retiro: string;
  fecha_devolucion: string;
  estado: string;
  clients: { nombre: string } | null;
};

function ReservasDelProducto({ productId }: { productId: string }) {
  const [reservas, setReservas] = useState<ReservaDelProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error } = await getSupabaseClient()
        .from("reservations")
        .select("id, numero_pedido, fecha_retiro, fecha_devolucion, estado, clients(nombre)")
        .eq("product_id", productId)
        .neq("estado", "cancelado")
        .order("fecha_retiro", { ascending: true });

      if (cancelled) return;
      if (error) setError(error.message);
      setReservas((data ?? []) as unknown as ReservaDelProducto[]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) return <p className="text-sm text-taupe">Cargando...</p>;
  if (error) return <p className="text-sm text-chocolate">Error al cargar: {error}</p>;
  if (reservas.length === 0) {
    return <p className="text-sm text-taupe">Esta prenda no tiene reservas cargadas.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-[3px] border border-arena">
      <table className="min-w-full divide-y divide-arena">
        <thead className="bg-crema">
          <tr>
            {["Pedido", "Clienta", "Retiro", "Devolución", "Estado"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-arena bg-blanco">
          {reservas.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 text-sm text-chocolate">#{r.numero_pedido ?? "—"}</td>
              <td className="px-4 py-3 text-sm text-negro">{r.clients?.nombre ?? "Clienta"}</td>
              <td className="px-4 py-3 text-sm text-chocolate">{formatFechaCorta(r.fecha_retiro)}</td>
              <td className="px-4 py-3 text-sm text-chocolate">{formatFechaCorta(r.fecha_devolucion)}</td>
              <td className="px-4 py-3 text-sm text-chocolate">
                {ESTADO_LABEL[r.estado] ?? r.estado}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DisponibilidadContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [skuInput, setSkuInput] = useState("");
  const [productId, setProductId] = useState("");
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      const { data } = await getSupabaseClient().from("products").select("*").order("nombre");
      setProducts(data ?? []);
      setLoadingData(false);
    }
    load();
  }, []);

  function handleSkuInputChange(value: string) {
    setSkuInput(value);
    setError(null);
    const sku = value.trim().toUpperCase();
    if (!sku) {
      setProductId("");
      return;
    }
    const product = products.find((p) => p.sku.toUpperCase() === sku);
    setProductId(product ? product.id : "");
  }

  function handleProductChange(id: string) {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    setSkuInput(product ? product.sku : "");
    setError(null);
  }

  function handleScan(textoDecodificado: string) {
    setEscaneando(false);
    const sku = skuDesdeTextoEscaneado(textoDecodificado);
    const product = products.find((p) => p.sku.toUpperCase() === sku);
    if (!product) {
      setError(`No encontramos ninguna prenda con el SKU "${sku}".`);
      return;
    }
    setError(null);
    setSkuInput(product.sku);
    setProductId(product.id);
  }

  if (loadingData) return <p className="text-sm text-taupe">Cargando...</p>;

  const producto = products.find((p) => p.id === productId);
  const encontrado = skuInput.trim()
    ? products.find((p) => p.sku.toUpperCase() === skuInput.trim().toUpperCase())
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xl">
        <label className="flex flex-col gap-1 text-sm text-negro">
          Buscar por SKU
          <div className="flex gap-2">
            <input
              type="text"
              value={skuInput}
              onChange={(e) => handleSkuInputChange(e.target.value)}
              placeholder="SKU (ej. VES-00123)"
              className={`${inputClass} flex-1 uppercase placeholder:normal-case`}
            />
            <button
              type="button"
              onClick={() => setEscaneando(true)}
              aria-label="Escanear SKU con la cámara"
              title="Escanear SKU con la cámara"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-[3px] border border-taupe text-negro hover:border-negro"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 7a2 2 0 0 1 2-2h1.2l.9-1.4A1 1 0 0 1 9 3h6a1 1 0 0 1 .9.6L16.8 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
                <circle cx="12" cy="13" r="3.4" />
              </svg>
            </button>
          </div>
          {skuInput.trim() && !encontrado && (
            <p className="text-xs text-taupe">No encontramos ninguna prenda con ese SKU.</p>
          )}
          <select value={productId} onChange={(e) => handleProductChange(e.target.value)} className={inputClass}>
            <option value="">...o elegí de la lista</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.talle ? `(${p.talle})` : ""} — {p.sku}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="mt-2 text-sm text-chocolate">{error}</p>}
      </div>

      {escaneando && <QrScannerModal onScan={handleScan} onClose={() => setEscaneando(false)} />}

      {producto && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-[3px] border border-arena bg-crema">
              {fotoPrincipal(producto) && (
                <Image
                  src={fotoPrincipal(producto)!}
                  alt={producto.nombre}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-negro">
                {producto.nombre}
                <span className="ml-1 text-xs font-normal uppercase tracking-wider text-taupe">
                  ({[producto.sku, producto.talle ? `talle ${producto.talle}` : null].filter(Boolean).join(" · ")})
                </span>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-chocolate">
              Fechas en que se va
            </h2>
            <p className="mt-1 text-xs text-taupe">
              Retiro y devolución de cada reserva de esta prenda.
            </p>
            <div className="mt-2">
              <ReservasDelProducto productId={producto.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDisponibilidadPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff roles={ROLES_ADMIN_CAJA}>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Disponibilidad
            </h1>
            <p className="mt-1 text-sm text-chocolate">
              Buscá una prenda por SKU para ver qué días está ocupada y quién la tiene reservada.
            </p>
            <div className="mt-8">
              <DisponibilidadContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
