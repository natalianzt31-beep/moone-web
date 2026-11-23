"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { CompletaTuLook } from "@/components/CompletaTuLook";
import { ShareButton } from "@/components/ShareButton";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Product } from "@/lib/supabase/types";

function nombreSinTalle(nombre: string) {
  return nombre.replace(/\s*talle\s*\S+\s*$/i, "").trim();
}

// Si esta página se abrió desde el redirect de /p/[sku] (etiqueta física
// con QR, buscador por SKU o un link viejo), la URL trae ?sku=. A quien es
// staff le mostramos un acceso para editar ese producto puntual en Stock —
// pero NUNCA la sacamos de la ficha automáticamente: antes se la redirigía
// sola al admin y eso pasaba también al entrar por un link compartido o
// guardado, no solo al escanear. Además se limpia el ?sku= de la URL para
// que no viaje al compartir la ficha.
// Aparte en su propio componente porque useSearchParams() necesita un
// límite de Suspense para poder prerenderizarse estáticamente.
function AccesoStaffDesdeEtiqueta() {
  const { isStaff, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [skuEscaneado] = useState(() => searchParams.get("sku"));

  useEffect(() => {
    if (!searchParams.get("sku")) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("sku");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [searchParams]);

  if (authLoading || !isStaff || !skuEscaneado) return null;

  return (
    <div className="mx-auto max-w-sm px-4 pt-6 sm:px-8">
      <Link
        href={`/admin/stock?sku=${encodeURIComponent(skuEscaneado)}`}
        className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-chocolate underline-offset-2 hover:underline"
      >
        Editar {skuEscaneado} en Stock →
      </Link>
    </div>
  );
}

export function VestidoDetailClient({ variantes }: { variantes: Product[] }) {
  const nombreBase = nombreSinTalle(variantes[0].nombre);
  // precio_alquiler es 0 (no null) en los vestidos que son solo venta definitiva.
  const tipo = variantes[0].precio_alquiler > 0 ? "alquiler" : "venta";
  const [fechas, setFechas] = useState<{ retiro: string; devolucion: string } | null>(null);
  const [agregado, setAgregado] = useState(false);
  // Con varios talles todavía no sabemos cuál va a elegir: no anclamos el
  // talle de los complementos a ninguno en particular.
  const seleccion = useMemo(
    () => (variantes.length === 1 ? variantes : [{ ...variantes[0], talle: null }]),
    [variantes]
  );

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <Suspense fallback={null}>
        <AccesoStaffDesdeEtiqueta />
      </Suspense>
      <main className="flex-1">
        <section className="mx-auto max-w-sm px-4 py-10 sm:px-8 sm:py-16">
          <Link
            href="/coleccion/vestidos"
            className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← Vestidos
          </Link>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              {nombreBase}
            </h1>
            <ShareButton title={nombreBase} />
          </div>

          <div className="mt-6">
            <GroupedProductCard
              variantes={variantes}
              tipo={tipo}
              preload
              onFechasChange={setFechas}
              onAgregadoAlCarrito={() => setAgregado(true)}
            />
          </div>

          {tipo === "alquiler" && (
            <CompletaTuLook
              seleccion={seleccion}
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
        </section>
      </main>
    </div>
  );
}
