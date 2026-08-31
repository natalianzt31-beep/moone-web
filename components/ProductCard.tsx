"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { currencyFormatter } from "@/lib/site-config";
import { addToCart } from "@/lib/supabase/account";
import { crearPreferenciaReserva, crearPreferenciaVenta } from "@/lib/mercadopago-client";
import { DisponibilidadCalendar } from "@/components/DisponibilidadCalendar";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";
import type { Product } from "@/lib/supabase/types";

export function ProductCard({
  product,
  tipo,
}: {
  product: Product;
  tipo: "alquiler" | "venta";
}) {
  const { user, client, loading: authLoading } = useAuth();
  const [cartState, setCartState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [fechaRetiro, setFechaRetiro] = useState<string | null>(null);
  const [fechaDevolucion, setFechaDevolucion] = useState<string | null>(null);
  const [payingMp, setPayingMp] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);

  const precio = tipo === "venta" ? product.precio_venta : product.precio_alquiler;
  const detalle = [product.talle, product.color].filter(Boolean).join(" · ");
  const cta = tipo === "venta" ? "Comprar" : "Reservar y pagar seña";
  const fotos =
    product.fotos && product.fotos.length > 0
      ? product.fotos
      : product.foto_url
        ? [product.foto_url]
        : [];
  // La venta definitiva no tiene calendario de retiro/devolución: se compra directo.
  const fechaElegida = tipo === "venta" || Boolean(fechaRetiro);

  async function handleAddToCart() {
    if (!client) return;
    setCartState("adding");
    try {
      await addToCart(client.id, product.id, tipo);
      setCartState("added");
    } catch {
      setCartState("error");
    }
  }

  async function handleReservarYPagar() {
    if (tipo === "alquiler" && (!fechaRetiro || !fechaDevolucion)) return;
    setMpError(null);
    setPayingMp(true);
    try {
      const initPoint =
        tipo === "venta"
          ? await crearPreferenciaVenta({ productId: product.id })
          : await crearPreferenciaReserva({
              productId: product.id,
              fechaRetiro: fechaRetiro!,
              fechaDevolucion: fechaDevolucion!,
            });
      window.location.href = initPoint;
    } catch (err) {
      setMpError(err instanceof Error ? err.message : "Error desconocido");
      setPayingMp(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena bg-blanco">
        <ProductImageCarousel fotos={fotos} alt={product.nombre} />
        {tipo === "venta" && product.condicion && (
          <span className="absolute left-2 top-2 z-10 rounded-[3px] bg-negro px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-blanco">
            {product.condicion === "nuevo" ? "Nuevo" : "Usado"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-negro">{product.nombre}</span>
        {detalle && <span className="text-xs text-taupe">{detalle}</span>}
        {product.descripcion_web && (
          <p className="line-clamp-2 text-xs text-taupe">{product.descripcion_web}</p>
        )}
        <span className="text-sm text-negro">
          {precio != null ? currencyFormatter.format(precio) : "Consultar"}
        </span>
      </div>

      {tipo === "alquiler" && (
        <DisponibilidadCalendar
          productId={product.id}
          onSelect={(retiro, devolucion) => {
            setFechaRetiro(retiro);
            setFechaDevolucion(devolucion);
          }}
        />
      )}

      {!authLoading && !user ? (
        <Link
          href="/mi-cuenta/login"
          className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate"
        >
          {tipo === "venta" ? "Iniciá sesión para comprar" : "Iniciá sesión para reservar"}
        </Link>
      ) : fechaElegida ? (
        <button
          type="button"
          onClick={handleReservarYPagar}
          disabled={payingMp}
          className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
        >
          {payingMp ? "Redirigiendo a Mercado Pago..." : cta}
        </button>
      ) : (
        <span className="flex min-h-11 cursor-not-allowed items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco opacity-40">
          {cta}
        </span>
      )}
      {mpError && <p className="text-xs text-chocolate">{mpError}</p>}

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
