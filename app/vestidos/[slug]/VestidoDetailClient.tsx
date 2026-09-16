"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ProductCard } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Product } from "@/lib/supabase/types";

function nombreSinTalle(nombre: string) {
  return nombre.replace(/\s*talle\s*\S+\s*$/i, "").trim();
}

// Si esta página se abrió desde el redirect de /p/[sku] (etiqueta física
// con QR en el local) y quien entra es staff, la mandamos derecho a
// editar ese producto puntual en vez de mostrarle la ficha pública.
// Aparte en su propio componente porque useSearchParams() necesita un
// límite de Suspense para poder prerenderizarse estáticamente.
function RedirectStaffDesdeEtiqueta() {
  const { isStaff, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const skuEscaneado = searchParams.get("sku");

  useEffect(() => {
    if (authLoading || !isStaff || !skuEscaneado) return;
    router.replace(`/admin/stock?sku=${encodeURIComponent(skuEscaneado)}`);
  }, [authLoading, isStaff, skuEscaneado, router]);

  return null;
}

export function VestidoDetailClient({ variantes }: { variantes: Product[] }) {
  const nombreBase = nombreSinTalle(variantes[0].nombre);

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Suspense fallback={null}>
        <RedirectStaffDesdeEtiqueta />
      </Suspense>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-sm px-4 py-10 sm:px-8 sm:py-16">
          <Link
            href="/coleccion/vestidos"
            className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← Vestidos
          </Link>
          <h1 className="mt-1 text-xl font-normal tracking-tight text-negro sm:text-2xl">
            {nombreBase}
          </h1>

          <div className="mt-6">
            {variantes.length > 1 ? (
              <GroupedProductCard variantes={variantes} tipo="alquiler" preload />
            ) : (
              <ProductCard product={variantes[0]} tipo="alquiler" preload />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
