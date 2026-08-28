"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { currencyFormatter } from "@/lib/site-config";
import { addToCart } from "@/lib/supabase/account";
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

  const precio = tipo === "venta" ? product.precio_venta : product.precio_alquiler;
  const detalle = [product.talle, product.color].filter(Boolean).join(" · ");

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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena bg-blanco">
        {product.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.foto_url}
            alt={product.nombre}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-crema">
            <span className="text-xs uppercase tracking-wider text-taupe">
              Sin foto
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-negro">{product.nombre}</span>
        {detalle && <span className="text-xs text-taupe">{detalle}</span>}
        <span className="text-sm text-negro">
          {precio != null ? currencyFormatter.format(precio) : "Consultar"}
        </span>
      </div>

      <Link
        href={`/reservar/${product.id}?tipo=${tipo}`}
        className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate"
      >
        {tipo === "venta" ? "Comprar" : "Reservar"}
      </Link>

      {!authLoading && user && (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!client || cartState === "adding" || cartState === "added"}
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
