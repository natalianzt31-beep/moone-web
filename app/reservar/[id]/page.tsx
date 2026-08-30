"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter, WHATSAPP_URL } from "@/lib/site-config";
import type { Product } from "@/lib/supabase/types";

export default function ReservarPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") === "venta" ? "venta" : "alquiler";
  const fechaRetiro = searchParams.get("retiro");
  const fechaDevolucion = searchParams.get("devolucion");

  const { user, client, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingMp, setPayingMp] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
          .eq("id", params.id)
          .single();

        if (cancelled) return;

        if (error) {
          setError(error.message);
        } else {
          setProduct(data);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const precioTotal =
    tipo === "venta" ? product?.precio_venta ?? null : product?.precio_alquiler ?? null;
  const montoAhora =
    tipo === "venta" ? precioTotal : precioTotal != null ? precioTotal * 0.5 : null;

  const mensajeWhatsapp = product
    ? `Hola! Quiero ${tipo === "venta" ? "comprar" : "reservar"}: ${product.nombre}${
        product.talle ? ` (talle ${product.talle})` : ""
      }.${
        fechaRetiro && tipo === "alquiler"
          ? ` Retiro: ${fechaRetiro}${fechaDevolucion ? `, devolución: ${fechaDevolucion}` : ""}.`
          : ""
      } ${
        tipo === "venta"
          ? `Precio: ${precioTotal != null ? currencyFormatter.format(precioTotal) : "a consultar"}.`
          : `Seña (50%): ${montoAhora != null ? currencyFormatter.format(montoAhora) : "a consultar"}.`
      } ¿Cómo sigo con el pago?`
    : "";

  const puedeAbrirMercadoPago =
    tipo === "alquiler" && Boolean(fechaRetiro) && Boolean(fechaDevolucion) && Boolean(product);

  async function handlePagarMercadoPago() {
    if (!product || !fechaRetiro || !fechaDevolucion) return;
    setMpError(null);
    setPayingMp(true);
    try {
      const { data: sessionData } = await getSupabaseClient().auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setMpError("Tu sesión expiró. Volvé a iniciar sesión e intentá de nuevo.");
        return;
      }

      const res = await fetch("/api/mercadopago/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ productId: product.id, fechaRetiro, fechaDevolucion }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMpError(json.error ?? "No se pudo iniciar el pago.");
        return;
      }

      window.location.href = json.initPoint;
    } catch (err) {
      setMpError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setPayingMp(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
          <Link
            href="/coleccion"
            className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← Volver
          </Link>

          {loading && <p className="mt-8 text-sm text-taupe">Cargando...</p>}

          {!loading && (error || !product) && (
            <p className="mt-8 text-sm text-chocolate">
              No pudimos encontrar esta prenda{error ? `: ${error}` : "."}
            </p>
          )}

          {!loading && product && (
            <>
              <h1 className="mt-1 text-xl font-normal tracking-tight text-negro sm:text-2xl">
                {tipo === "venta" ? "Confirmar compra" : "Confirmar reserva"}
              </h1>

              <div className="mt-6 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-base font-medium text-negro">{product.nombre}</p>
                    <p className="mt-1 text-sm text-taupe">
                      {[product.talle, product.color].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-taupe">
                    {tipo === "venta" ? "Venta" : "Alquiler"}
                  </span>
                </div>

                {product.descripcion_web && (
                  <p className="mt-4 text-sm leading-relaxed text-chocolate">
                    {product.descripcion_web}
                  </p>
                )}

                {tipo === "alquiler" && fechaRetiro && (
                  <div className="mt-4 flex flex-col gap-1 border-t border-arena pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-chocolate">Retiro</span>
                      <span className="text-negro">{fechaRetiro}</span>
                    </div>
                    {fechaDevolucion && (
                      <div className="flex justify-between">
                        <span className="text-chocolate">Devolución</span>
                        <span className="text-negro">{fechaDevolucion}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-2 border-t border-arena pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-chocolate">
                      {tipo === "venta" ? "Precio" : "Precio de alquiler"}
                    </span>
                    <span className="text-negro">
                      {precioTotal != null ? currencyFormatter.format(precioTotal) : "A consultar"}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-negro">
                      {tipo === "venta" ? "Total a abonar" : "Seña a abonar ahora (50%)"}
                    </span>
                    <span className="text-negro">
                      {montoAhora != null ? currencyFormatter.format(montoAhora) : "A consultar"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[3px] bg-crema p-4 text-sm text-chocolate">
                Elegí cómo pagar la seña{tipo === "venta" ? " y coordinar tu compra" : ""}: online
                con Mercado Pago (queda confirmada al instante) o coordinando por WhatsApp.
              </div>

              {puedeAbrirMercadoPago && (
                <>
                  {authLoading ? null : user && client ? (
                    <button
                      type="button"
                      onClick={handlePagarMercadoPago}
                      disabled={payingMp}
                      className="mt-4 flex min-h-11 w-full items-center justify-center rounded-[3px] bg-[#009EE3] px-6 text-center text-sm font-medium text-blanco transition-colors hover:opacity-90 disabled:opacity-60"
                    >
                      {payingMp
                        ? "Redirigiendo a Mercado Pago..."
                        : `Pagar seña con Mercado Pago (${
                            montoAhora != null ? currencyFormatter.format(montoAhora) : ""
                          })`}
                    </button>
                  ) : (
                    <Link
                      href="/mi-cuenta/login"
                      className="mt-4 flex min-h-11 w-full items-center justify-center rounded-[3px] border border-negro px-6 text-center text-sm font-medium text-negro transition-colors hover:border-chocolate hover:text-chocolate"
                    >
                      Iniciá sesión para pagar con Mercado Pago
                    </Link>
                  )}
                  {mpError && <p className="mt-2 text-sm text-chocolate">{mpError}</p>}
                </>
              )}

              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(mensajeWhatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block rounded-[3px] bg-negro px-6 py-3 text-center text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
              >
                Coordinar por WhatsApp
              </a>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
