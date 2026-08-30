"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { RequireAuth } from "@/components/RequireAuth";
import { getSupabaseClient } from "@/lib/supabase/client";

function ReservaConfirmadaContent() {
  const searchParams = useSearchParams();
  const reservaId = searchParams.get("reserva");
  const status = searchParams.get("status") ?? searchParams.get("collection_status");

  const [seniaConfirmada, setSeniaConfirmada] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!reservaId) {
        setLoading(false);
        return;
      }
      const { data } = await getSupabaseClient()
        .from("reservations")
        .select("senia_confirmada")
        .eq("id", reservaId)
        .maybeSingle();

      if (!cancelled) {
        setSeniaConfirmada(data?.senia_confirmada ?? false);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reservaId]);

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
        {seniaConfirmada ? "¡Seña confirmada!" : "Estamos confirmando tu pago"}
      </h1>

      {loading ? (
        <p className="mt-4 text-sm text-taupe">Consultando el estado de tu pago...</p>
      ) : seniaConfirmada ? (
        <p className="mt-4 text-sm text-chocolate">
          Recibimos tu seña por Mercado Pago y tu reserva quedó confirmada. Te esperamos el día
          de retiro acordado.
        </p>
      ) : status === "rejected" ? (
        <p className="mt-4 text-sm text-chocolate">
          El pago no se pudo procesar. Podés volver a intentarlo desde la ficha de la prenda, o
          coordinar por WhatsApp.
        </p>
      ) : (
        <p className="mt-4 text-sm text-chocolate">
          Tu pago está siendo procesado por Mercado Pago. En cuanto se apruebe vas a ver el
          sellito de confirmación acá y en tu historial — puede tardar unos segundos.
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

export default function ReservaConfirmadaPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <RequireAuth>
        <MiCuentaNav />
        <main className="flex-1">
          <ReservaConfirmadaContent />
        </main>
      </RequireAuth>
    </div>
  );
}
