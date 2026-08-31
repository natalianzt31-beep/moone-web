"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { RequireAuth } from "@/components/RequireAuth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";

type CompraConfirmada = {
  monto: number;
  products: { nombre: string; talle: string | null } | null;
};

const MAX_INTENTOS = 6;

function CompraConfirmadaContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");
  const status = searchParams.get("status") ?? searchParams.get("collection_status");

  const [compra, setCompra] = useState<CompraConfirmada | null>(null);
  const [loading, setLoading] = useState(true);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function buscar() {
      const { data } = await getSupabaseClient()
        .from("payments")
        .select("monto, products(nombre, talle)")
        .eq("mp_payment_id", paymentId)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setCompra(data as unknown as CompraConfirmada);
        setLoading(false);
      } else if (intentos < MAX_INTENTOS) {
        setTimeout(() => {
          if (!cancelled) setIntentos((i) => i + 1);
        }, 1500);
      } else {
        setLoading(false);
      }
    }

    buscar();

    return () => {
      cancelled = true;
    };
  }, [paymentId, intentos]);

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
        {compra ? "¡Compra confirmada!" : "Estamos confirmando tu pago"}
      </h1>

      {loading ? (
        <p className="mt-4 text-sm text-taupe">Consultando el estado de tu pago...</p>
      ) : compra ? (
        <div className="mt-6 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
          <p className="text-base font-medium text-negro">
            {compra.products?.nombre ?? "Prenda"}
          </p>
          {compra.products?.talle && (
            <p className="mt-1 text-sm text-taupe">Talle {compra.products.talle}</p>
          )}
          <div className="mt-4 flex justify-between border-t border-arena pt-4 text-sm font-medium">
            <span className="text-negro">Total pagado</span>
            <span className="text-negro">{currencyFormatter.format(compra.monto)}</span>
          </div>
        </div>
      ) : status === "rejected" ? (
        <p className="mt-4 text-sm text-chocolate">
          El pago no se pudo procesar. Podés volver a intentarlo desde la ficha de la prenda.
        </p>
      ) : (
        <p className="mt-4 text-sm text-chocolate">
          Tu pago está siendo procesado por Mercado Pago. Puede tardar unos segundos — si no ves
          la confirmación acá, revisá tu historial en un momento.
        </p>
      )}

      <Link
        href="/mi-cuenta/historial"
        className="mt-6 flex min-h-11 w-fit items-center text-sm text-negro hover:text-chocolate"
      >
        Ir a mi historial →
      </Link>
    </section>
  );
}

export default function CompraConfirmadaPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <RequireAuth>
        <MiCuentaNav />
        <main className="flex-1">
          <CompraConfirmadaContent />
        </main>
      </RequireAuth>
    </div>
  );
}
