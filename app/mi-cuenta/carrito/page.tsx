"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchCartItems, removeFromCart } from "@/lib/supabase/account";
import { registrarUsoPromoCode, validatePromoCode } from "@/lib/supabase/promo";
import { currencyFormatter, WHATSAPP_URL } from "@/lib/site-config";
import type { Categoria, CartItem, PromoCode } from "@/lib/supabase/types";

function precioItem(item: CartItem) {
  return item.tipo === "venta" ? item.products?.precio_venta ?? null : item.products?.precio_alquiler ?? null;
}

function CarritoContent() {
  const { client, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [codigoInput, setCodigoInput] = useState("");
  const [promoAplicado, setPromoAplicado] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validandoPromo, setValidandoPromo] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (precioItem(item) ?? 0), 0),
    [items]
  );
  const descuento = promoAplicado ? Math.round((subtotal * promoAplicado.porcentaje) / 100) : 0;
  const totalFinal = subtotal - descuento;

  async function handleAplicarCodigo() {
    setPromoError(null);
    setValidandoPromo(true);
    try {
      const categorias = new Set<Categoria>(
        items.map((i) => i.products?.categoria).filter((c): c is Categoria => Boolean(c))
      );
      const resultado = await validatePromoCode(codigoInput, categorias);
      if (resultado.ok) {
        setPromoAplicado(resultado.promo);
      } else {
        setPromoAplicado(null);
        setPromoError(resultado.message);
      }
    } catch (err) {
      setPromoAplicado(null);
      setPromoError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setValidandoPromo(false);
    }
  }

  function handleQuitarCodigo() {
    setPromoAplicado(null);
    setPromoError(null);
    setCodigoInput("");
  }

  const mensajeWhatsapp = `Hola! Quiero confirmar mi reserva:\n${items
    .map((item) => `- ${item.products?.nombre ?? "Prenda"} (${item.tipo})`)
    .join("\n")}\nSubtotal: ${currencyFormatter.format(subtotal)}${
    promoAplicado
      ? `\nCódigo ${promoAplicado.codigo.toUpperCase()} (-${promoAplicado.porcentaje}%): -${currencyFormatter.format(descuento)}\nTotal: ${currencyFormatter.format(totalFinal)}`
      : ""
  }\n¿Cómo sigo con el pago?`;

  function handleConfirmarClick() {
    if (promoAplicado) {
      registrarUsoPromoCode(promoAplicado.codigo).catch(() => {
        // el uso no se pudo registrar; no bloqueamos la coordinación por WhatsApp
      });
    }
  }

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

          <div className="mt-4 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
            <label className="flex flex-col gap-1 text-sm text-negro">
              Código de descuento
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  placeholder="Ej: VESTIDOSAND"
                  disabled={Boolean(promoAplicado)}
                  className="min-h-11 flex-1 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm uppercase text-negro focus:border-negro focus:outline-none disabled:bg-crema"
                />
                {promoAplicado ? (
                  <button
                    type="button"
                    onClick={handleQuitarCodigo}
                    className="flex min-h-11 items-center justify-center rounded-[3px] border border-negro px-4 text-xs font-medium uppercase tracking-wider text-negro transition-colors hover:border-chocolate hover:text-chocolate"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAplicarCodigo}
                    disabled={validandoPromo || !codigoInput.trim()}
                    className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
                  >
                    {validandoPromo ? "Validando..." : "Aplicar"}
                  </button>
                )}
              </div>
            </label>

            {promoError && <p className="mt-2 text-sm text-chocolate">{promoError}</p>}
            {promoAplicado && (
              <p className="mt-2 text-sm text-chocolate">
                Código {promoAplicado.codigo.toUpperCase()} aplicado: {promoAplicado.porcentaje}%
                OFF.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2 border-t border-arena pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-chocolate">Subtotal</span>
                <span className="text-negro">{currencyFormatter.format(subtotal)}</span>
              </div>
              {promoAplicado && (
                <div className="flex justify-between">
                  <span className="text-chocolate">Descuento ({promoAplicado.porcentaje}%)</span>
                  <span className="text-negro">-{currencyFormatter.format(descuento)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span className="text-negro">Total</span>
                <span className="text-negro">{currencyFormatter.format(totalFinal)}</span>
              </div>
            </div>

            <a
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(mensajeWhatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleConfirmarClick}
              className="mt-4 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-center text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
            >
              Confirmar reserva por WhatsApp
            </a>
          </div>
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
