"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { checkoutEnabled } from "@/lib/features";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { CompletaTuLook } from "@/components/CompletaTuLook";
import type { RecoProducto } from "@/lib/recomendaciones/motor";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchCartItems, removeFromCart, updateClientDatos } from "@/lib/supabase/account";
import { CART_UPDATED_EVENT, notifyCartUpdated } from "@/lib/cartEvents";
import { crearPreferenciaCarrito, crearPreferenciaVenta } from "@/lib/mercadopago-client";
import { crearPedidoLocalVenta } from "@/lib/pago-local-client";
import { fetchClosedDatesSet } from "@/lib/supabase/closedDates";
import { nextBusinessDay, sugerirDevolucion, toISODate } from "@/lib/disponibilidad";
import { currencyFormatter } from "@/lib/site-config";
import type { CartItem } from "@/lib/supabase/types";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

function DatosClienteForm({
  clientId,
  nombreActual,
}: {
  clientId: string;
  nombreActual: string;
}) {
  const { refreshClient } = useAuth();
  const [nombre, setNombre] = useState(/@/.test(nombreActual) ? "" : nombreActual);
  const [celular, setCelular] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !celular.trim()) {
      setError("Completá nombre y celular para continuar.");
      return;
    }

    setGuardando(true);
    try {
      await updateClientDatos(clientId, { nombre: nombre.trim(), celular: celular.trim() });
      await refreshClient();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(
        message.includes("duplicate") || message.includes("clients_celular_key")
          ? "Ya existe una cuenta con ese celular."
          : message
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mt-8 max-w-md rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
      <h2 className="text-base font-medium text-negro">Completá tus datos</h2>
      <p className="mt-1 text-sm text-chocolate">
        Nos falta tu celular para poder coordinar el retiro y la devolución de la prenda.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-negro">
          Nombre completo
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Celular
          <input
            type="tel"
            required
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="093 787 376"
            className={inputClass}
          />
        </label>
        {error && <p className="text-sm text-chocolate">{error}</p>}
        <button
          type="submit"
          disabled={guardando}
          className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar y continuar"}
        </button>
      </form>
    </div>
  );
}

function precioItem(item: CartItem) {
  return item.tipo === "venta" ? item.products?.precio_venta ?? null : item.products?.precio_alquiler ?? null;
}

function CarritoContent() {
  const { client, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<{ itemId: string; message: string } | null>(null);
  const [payingLocalId, setPayingLocalId] = useState<string | null>(null);
  const [localOkIds, setLocalOkIds] = useState<Set<string>>(new Set());
  const [localError, setLocalError] = useState<{ itemId: string; message: string } | null>(null);

  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [devolucionManual, setDevolucionManual] = useState(false);
  const [tipoPagoAlquiler, setTipoPagoAlquiler] = useState<"senia" | "total">("senia");
  const [payingPedido, setPayingPedido] = useState(false);
  const [pedidoError, setPedidoError] = useState<string | null>(null);

  const datosCompletos = Boolean(client?.celular?.trim());

  const itemsAlquiler = useMemo(() => items.filter((i) => i.tipo === "alquiler"), [items]);
  const subtotalAlquiler = useMemo(
    () => itemsAlquiler.reduce((sum, item) => sum + (precioItem(item) ?? 0), 0),
    [itemsAlquiler]
  );
  const totalAlquiler = subtotalAlquiler;
  const seleccionLook = useMemo(
    () =>
      itemsAlquiler
        .map((i) => i.products)
        .filter((p): p is NonNullable<typeof p> => Boolean(p)) as RecoProducto[],
    [itemsAlquiler]
  );
  const seniaAlquiler = Math.round(totalAlquiler * 0.5);
  const montoAPagarAlquiler = tipoPagoAlquiler === "total" ? totalAlquiler : seniaAlquiler;

  useEffect(() => {
    if (itemsAlquiler.length === 0 || fechaRetiro) return;

    let cancelled = false;
    async function load() {
      const closed = await fetchClosedDatesSet();
      if (cancelled) return;
      setClosedDates(closed);
      const retiro = nextBusinessDay(toISODate(new Date()), closed);
      setFechaRetiro(retiro);
      setFechaDevolucion(sugerirDevolucion(retiro, closed));
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsAlquiler.length]);

  function handleFechaRetiroChange(value: string) {
    const ajustada = nextBusinessDay(value, closedDates);
    setFechaRetiro(ajustada);
    if (!devolucionManual) {
      setFechaDevolucion(sugerirDevolucion(ajustada, closedDates));
    }
  }

  function handleFechaDevolucionChange(value: string) {
    setDevolucionManual(true);
    setFechaDevolucion(value);
  }

  async function handlePagarPedidoAlquiler() {
    setPedidoError(null);
    setPayingPedido(true);
    try {
      const initPoint = await crearPreferenciaCarrito({
        productIds: itemsAlquiler.map((i) => i.product_id),
        fechaRetiro,
        fechaDevolucion,
        tipoPago: tipoPagoAlquiler,
      });
      window.location.href = initPoint;
    } catch (err) {
      setPedidoError(err instanceof Error ? err.message : "Error desconocido");
      setPayingPedido(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!client) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const clientId = client.id;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCartItems(clientId);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    // Si se agrega otro artículo desde una ficha mientras esta página sigue
    // viva en el router cache (volver atrás/adelante sin remontar), hay que
    // volver a pedir el carrito para no quedarnos con una lista vieja.
    window.addEventListener(CART_UPDATED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_UPDATED_EVENT, load);
    };
  }, [client, authLoading]);

  async function handlePagarVenta(item: CartItem) {
    setPayError(null);
    setPayingId(item.id);
    try {
      const initPoint = await crearPreferenciaVenta({ productId: item.product_id });
      window.location.href = initPoint;
    } catch (err) {
      setPayError({
        itemId: item.id,
        message: err instanceof Error ? err.message : "Error desconocido",
      });
      setPayingId(null);
    }
  }

  async function handlePagarLocalVenta(item: CartItem) {
    setLocalError(null);
    setPayingLocalId(item.id);
    try {
      await crearPedidoLocalVenta({ productId: item.product_id });
      setLocalOkIds((prev) => new Set(prev).add(item.id));
    } catch (err) {
      setLocalError({
        itemId: item.id,
        message: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setPayingLocalId(null);
    }
  }

  async function handleRemove(itemId: string) {
    setRemovingId(itemId);
    try {
      await removeFromCart(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      notifyCartUpdated();
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
            const foto = item.products?.fotos?.[0] ?? item.products?.foto_url ?? null;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[3px] border border-arena bg-blanco p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[3px] border border-arena bg-crema">
                    {foto && (
                      <Image
                        src={foto}
                        alt={item.products?.nombre ?? "Prenda"}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-medium text-negro">
                      {item.products?.nombre ?? "Prenda"}
                    </p>
                    <p className="mt-1 text-sm text-taupe">
                      {item.tipo === "venta" ? "Venta" : "Alquiler"}
                      {precio != null && ` · ${currencyFormatter.format(precio)}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {/* Las prendas de alquiler no tienen botón propio: se
                      reservan todas juntas en el bloque de abajo. */}
                  {item.tipo === "alquiler" ? null : !datosCompletos ? (
                    <span className="flex min-h-11 flex-1 cursor-not-allowed items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco opacity-40 sm:flex-none">
                      Comprar con Mercado Pago
                    </span>
                  ) : localOkIds.has(item.id) ? (
                    <span className="flex min-h-11 flex-1 items-center justify-center text-center text-xs text-chocolate sm:flex-none">
                      Pedido registrado — pagá en el local ✓
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePagarVenta(item)}
                        disabled={payingId === item.id || payingLocalId === item.id}
                        className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] bg-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60 sm:flex-none"
                      >
                        {payingId === item.id ? "Redirigiendo..." : "Comprar con Mercado Pago"}
                      </button>
                      {item.products?.categoria !== "vestido" && (
                        <button
                          type="button"
                          onClick={() => handlePagarLocalVenta(item)}
                          disabled={payingId === item.id || payingLocalId === item.id}
                          className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] border border-negro px-4 text-center text-xs font-medium uppercase tracking-wider text-negro transition-colors hover:border-chocolate hover:text-chocolate disabled:opacity-60 sm:flex-none"
                        >
                          {payingLocalId === item.id ? "Registrando..." : "Pagar en el local"}
                        </button>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] border border-arena px-4 text-center text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60 sm:flex-none"
                  >
                    {removingId === item.id ? "Quitando..." : "Eliminar"}
                  </button>
                </div>
                {item.tipo === "venta" && payError?.itemId === item.id && (
                  <p className="text-xs text-chocolate">{payError.message}</p>
                )}
                {item.tipo === "venta" && localError?.itemId === item.id && (
                  <p className="text-xs text-chocolate">{localError.message}</p>
                )}
              </div>
            );
          })}

          {seleccionLook.length > 0 && (
            <CompletaTuLook
              seleccion={seleccionLook}
              origen="carrito"
              fechas={fechaRetiro && fechaDevolucion ? { retiro: fechaRetiro, devolucion: fechaDevolucion } : null}
              titulo="Antes de reservar, ¿le sumamos algo a tu look?"
              subtitulo="Te sugerimos solo lo que todavía no elegiste."
              min={1}
              max={4}
              incluirCarrito={false}
              excluirIds={items.map((i) => i.product_id)}
            />
          )}

          {itemsAlquiler.length > 0 && (
            <div
              id="reservar-alquiler"
              className="mt-4 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6"
            >
              <h2 className="text-base font-medium text-negro">
                Reservar {itemsAlquiler.length > 1 ? "las prendas de alquiler juntas" : "la prenda"}
              </h2>
              <p className="mt-1 text-sm text-chocolate">
                Elegí la fecha de retiro — vale para{" "}
                {itemsAlquiler.length > 1 ? "todas las prendas de alquiler del carrito" : "esta prenda"}.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-negro">
                  Fecha de retiro
                  <input
                    type="date"
                    value={fechaRetiro}
                    onChange={(e) => handleFechaRetiroChange(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-negro">
                  Fecha de devolución
                  <input
                    type="date"
                    value={fechaDevolucion}
                    onChange={(e) => handleFechaDevolucionChange(e.target.value)}
                    className={inputClass}
                  />
                  <span className="text-xs text-taupe">Sugerida automáticamente.</span>
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-arena pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-chocolate">Subtotal alquiler</span>
                  <span className="text-negro">{currencyFormatter.format(subtotalAlquiler)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-4 text-sm text-negro">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={tipoPagoAlquiler === "senia"}
                    onChange={() => setTipoPagoAlquiler("senia")}
                  />
                  Pagar seña (50%)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={tipoPagoAlquiler === "total"}
                    onChange={() => setTipoPagoAlquiler("total")}
                  />
                  Pagar el total (100%)
                </label>
              </div>

              <div className="mt-2 flex justify-between text-sm font-medium">
                <span className="text-negro">
                  {tipoPagoAlquiler === "total" ? "Total a pagar ahora" : "Seña a pagar ahora"}
                </span>
                <span className="text-negro">{currencyFormatter.format(montoAPagarAlquiler)}</span>
              </div>

              {pedidoError && <p className="mt-3 text-sm text-chocolate">{pedidoError}</p>}

              <button
                type="button"
                onClick={handlePagarPedidoAlquiler}
                disabled={!datosCompletos || !fechaRetiro || payingPedido}
                className="mt-4 flex min-h-11 w-full items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
              >
                {payingPedido
                  ? "Redirigiendo..."
                  : tipoPagoAlquiler === "total"
                    ? "Pagar el total y reservar con Mercado Pago"
                    : "Pagar seña y reservar con Mercado Pago"}
              </button>
              {!datosCompletos && (
                <p className="mt-2 text-xs text-taupe">
                  Completá tus datos abajo para poder reservar.
                </p>
              )}
            </div>
          )}

          {!datosCompletos && client && (
            <DatosClienteForm clientId={client.id} nombreActual={client.nombre} />
          )}
        </div>
      )}
    </section>
  );
}

export default function CarritoPage() {
  if (!checkoutEnabled) {
    redirect("/coleccion");
  }

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
