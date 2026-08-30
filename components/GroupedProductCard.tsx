"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { currencyFormatter } from "@/lib/site-config";
import { addToCart } from "@/lib/supabase/account";
import { compararTalles } from "@/lib/talles";
import { DisponibilidadCalendar } from "@/components/DisponibilidadCalendar";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import type { Product } from "@/lib/supabase/types";

function nombreSinTalle(nombre: string) {
  return nombre.replace(/\s*talle\s*\S+\s*$/i, "").trim();
}

export function GroupedProductCard({
  variantes,
  tipo,
}: {
  variantes: Product[];
  tipo: "alquiler" | "venta";
}) {
  const ordenadas = useMemo(
    () => [...variantes].sort((a, b) => compararTalles(a.talle, b.talle)),
    [variantes]
  );

  const primero = ordenadas[0];
  const nombreBase = nombreSinTalle(primero.nombre);

  // Puede haber más de una unidad del mismo talle (ej. 2 unidades de S):
  // el selector muestra un talle una sola vez, y al elegirlo se resuelve
  // a una unidad disponible de ese talle.
  const tallesUnicos = useMemo(
    () => Array.from(new Set(ordenadas.map((p) => p.talle))),
    [ordenadas]
  );

  const [talleSeleccionado, setTalleSeleccionado] = useState(primero.talle);
  const producto =
    ordenadas.find((p) => p.talle === talleSeleccionado && p.estado === "disponible") ??
    ordenadas.find((p) => p.talle === talleSeleccionado) ??
    primero;

  const { user, client, loading: authLoading } = useAuth();
  const [cartState, setCartState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [fechaRetiro, setFechaRetiro] = useState<string | null>(null);
  const [fechaDevolucion, setFechaDevolucion] = useState<string | null>(null);

  const precio = tipo === "venta" ? producto.precio_venta : producto.precio_alquiler;
  const cta = tipo === "venta" ? "Comprar" : "Reservar";
  const fotos =
    producto.fotos && producto.fotos.length > 0
      ? producto.fotos
      : producto.foto_url
        ? [producto.foto_url]
        : [];
  // La venta definitiva no tiene calendario de retiro/devolución: se compra directo.
  const fechaElegida = tipo === "venta" || Boolean(fechaRetiro);
  const hrefReservar =
    tipo === "alquiler" && fechaRetiro && fechaDevolucion
      ? `/reservar/${producto.id}?tipo=${tipo}&retiro=${fechaRetiro}&devolucion=${fechaDevolucion}`
      : `/reservar/${producto.id}?tipo=${tipo}`;

  async function handleAddToCart() {
    if (!client) return;
    setCartState("adding");
    try {
      await addToCart(client.id, producto.id, tipo);
      setCartState("added");
    } catch {
      setCartState("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena bg-blanco">
        <ProductImageCarousel key={producto.id} fotos={fotos} alt={nombreBase} />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-negro">{nombreBase}</span>
        {producto.color && <span className="text-xs text-taupe">{producto.color}</span>}
        {producto.descripcion_web && (
          <p className="line-clamp-2 text-xs text-taupe">{producto.descripcion_web}</p>
        )}
        <span className="text-sm text-negro">
          {precio != null ? currencyFormatter.format(precio) : "Consultar"}
        </span>
      </div>

      <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-taupe">
        Talle
        <select
          value={talleSeleccionado ?? ""}
          onChange={(e) => {
            setTalleSeleccionado(e.target.value);
            setCartState("idle");
            setFechaRetiro(null);
            setFechaDevolucion(null);
          }}
          className="min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 text-sm normal-case tracking-normal text-negro focus:border-negro focus:outline-none"
        >
          {tallesUnicos.map((talle) => (
            <option key={talle} value={talle ?? ""}>
              {talle}
            </option>
          ))}
        </select>
      </label>

      {tipo === "alquiler" && (
        <DisponibilidadCalendar
          key={producto.id}
          productId={producto.id}
          onSelect={(retiro, devolucion) => {
            setFechaRetiro(retiro);
            setFechaDevolucion(devolucion);
          }}
        />
      )}

      {fechaElegida ? (
        <Link
          href={hrefReservar}
          className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate"
        >
          {cta}
        </Link>
      ) : (
        <span className="flex min-h-11 cursor-not-allowed items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco opacity-40">
          {cta}
        </span>
      )}

      {!authLoading && user && (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!fechaElegida || !client || cartState === "adding" || cartState === "added"}
          className="flex min-h-11 items-center justify-center rounded-[3px] border border-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-negro transition-colors hover:border-chocolate hover:text-chocolate disabled:opacity-60"
        >
          {cartState === "adding" && "Agregando..."}
          {cartState === "added" && "En tu carrito ✓"}
          {cartState === "error" && "Error, probá de nuevo"}
          {cartState === "idle" && "Agregar al carrito"}
        </button>
      )}

      {!authLoading && !user && (
        <Link
          href="/mi-cuenta/login"
          className="flex min-h-11 items-center justify-center text-center text-xs text-taupe transition-colors hover:text-chocolate"
        >
          Iniciá sesión para agregar al carrito
        </Link>
      )}
    </div>
  );
}
