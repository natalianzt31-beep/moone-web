"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter, WHATSAPP_URL } from "@/lib/site-config";
import type { Product } from "@/lib/supabase/types";

// Esta página es solo para venta definitiva (pago 100% y coordinación por
// WhatsApp). El alquiler paga la seña directo desde la ficha con Mercado
// Pago y nunca pasa por acá.
export default function ReservarPage() {
  const params = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const precio = product?.precio_venta ?? null;

  const mensajeWhatsapp = product
    ? `Hola! Quiero comprar: ${product.nombre}${
        product.talle ? ` (talle ${product.talle})` : ""
      }. Precio: ${precio != null ? currencyFormatter.format(precio) : "a consultar"}. ¿Cómo sigo con el pago?`
    : "";

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
          <Link
            href="/sale"
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
                Confirmar compra
              </h1>

              <div className="mt-6 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-base font-medium text-negro">{product.nombre}</p>
                    <p className="mt-1 text-sm text-taupe">
                      {[product.talle, product.color].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-taupe">Venta</span>
                </div>

                {product.descripcion_web && (
                  <p className="mt-4 text-sm leading-relaxed text-chocolate">
                    {product.descripcion_web}
                  </p>
                )}

                <div className="mt-6 flex justify-between border-t border-arena pt-4 text-sm font-medium">
                  <span className="text-negro">Total a abonar</span>
                  <span className="text-negro">
                    {precio != null ? currencyFormatter.format(precio) : "A consultar"}
                  </span>
                </div>
              </div>

              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(mensajeWhatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block rounded-[3px] bg-negro px-6 py-3 text-center text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
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
