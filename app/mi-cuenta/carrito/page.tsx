"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchCartItems, removeFromCart } from "@/lib/supabase/account";
import { currencyFormatter } from "@/lib/site-config";
import type { CartItem } from "@/lib/supabase/types";

function CarritoContent() {
  const { client, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!client) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCartItems(client!.id);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [client, authLoading]);

  async function handleRemove(itemId: string) {
    setRemovingId(itemId);
    try {
      await removeFromCart(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
        Mi carrito
      </h1>
      <p className="mt-1 text-sm text-chocolate">
        Prendas que guardaste pero todavía no reservaste.
      </p>

      {(authLoading || loading) && (
        <p className="mt-8 text-sm text-taupe">Cargando carrito...</p>
      )}

      {!authLoading && !loading && !client && (
        <p className="mt-8 text-sm text-chocolate">
          No pudimos cargar tu cuenta. Probá cerrar sesión y volver a entrar.
        </p>
      )}

      {!authLoading && !loading && client && error && (
        <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
      )}

      {!authLoading && !loading && client && !error && items.length === 0 && (
        <p className="mt-8 text-sm text-taupe">
          Tu carrito está vacío. Mirá la{" "}
          <Link href="/coleccion" className="text-negro hover:text-chocolate">
            Colección
          </Link>
          .
        </p>
      )}

      {!authLoading && !loading && client && !error && items.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {items.map((item) => {
            const precio =
              item.tipo === "venta"
                ? item.products?.precio_venta
                : item.products?.precio_alquiler;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[3px] border border-arena bg-blanco p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div>
                  <p className="text-base font-medium text-negro">
                    {item.products?.nombre ?? "Prenda"}
                  </p>
                  <p className="mt-1 text-sm text-taupe">
                    {item.tipo === "venta" ? "Venta" : "Alquiler"}
                    {precio != null && ` · ${currencyFormatter.format(precio)}`}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/reservar/${item.product_id}?tipo=${item.tipo}`}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate sm:flex-none"
                  >
                    Continuar reserva
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] border border-arena px-4 text-center text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60 sm:flex-none"
                  >
                    {removingId === item.id ? "Quitando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function CarritoPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <RequireAuth>
        <MiCuentaNav />
        <main className="flex-1">
          <CarritoContent />
        </main>
      </RequireAuth>
    </div>
  );
}
