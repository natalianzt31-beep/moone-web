"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { CompletaTuLook } from "@/components/CompletaTuLook";
import { ShareButton } from "@/components/ShareButton";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/supabase/types";

/**
 * Ficha de un producto por SKU — es la URL que usan las tarjetas del
 * catálogo para todo lo que no sea vestido (mono, sandalia, cartera,
 * tapado, accesorio), así que la pisa tanto quien escaneó la etiqueta
 * física en el local como cualquier clienta navegando el sitio normal, sin
 * forma de distinguir una cosa de la otra por la URL. Por eso para staff
 * no redirige sola a /admin/stock (eso rompía la navegación normal del
 * sitio estando logueada como staff) — solo muestra un acceso directo de
 * edición arriba de la ficha pública de siempre.
 */
export function ProductoClient({ sku }: { sku: string }) {
  const { isStaff, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechas, setFechas] = useState<{ retiro: string; devolucion: string } | null>(null);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("*")
          .eq("sku", sku)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [sku]);

  const mostrarAccesoStaff = !authLoading && isStaff && !loading && product;

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-sm px-4 py-10 sm:px-8 sm:py-16">
          {mostrarAccesoStaff && (
            <Link
              href={`/admin/stock?sku=${encodeURIComponent(sku)}`}
              className="mb-4 flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-chocolate underline-offset-2 hover:underline"
            >
              Editar en Stock →
            </Link>
          )}

          {(authLoading || loading) && <p className="text-sm text-taupe">Cargando...</p>}

          {!authLoading && !loading && (error || !product) && (
            <p className="text-sm text-chocolate">
              No encontramos ninguna prenda con el código {sku}
              {error ? `: ${error}` : "."}
            </p>
          )}

          {!authLoading && !loading && product && (
            product.estado === "baja_definitiva" ? (
              <div>
                <p className="text-base font-medium text-negro">{product.nombre}</p>
                <p className="mt-2 text-sm text-chocolate">Esta prenda ya no está disponible.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <ShareButton title={product.nombre} />
                </div>
                <ProductCard
                  product={product}
                  tipo={product.precio_venta != null ? "venta" : "alquiler"}
                  onFechasChange={setFechas}
                  onAgregadoAlCarrito={() => setAgregado(true)}
                />
                {product.precio_venta == null && product.precio_alquiler > 0 && (
                  <CompletaTuLook
                    seleccion={[product]}
                    origen={agregado ? "post_agregar" : "ficha"}
                    fechas={fechas}
                    {...(agregado
                      ? {
                          titulo: "¡Tu look está tomando forma! ¿Le sumamos el toque final?",
                          subtitulo: "Sumá complementos sin salir de acá.",
                          min: 1,
                        }
                      : {})}
                  />
                )}
              </>
            )
          )}
        </section>
      </main>
    </div>
  );
}
