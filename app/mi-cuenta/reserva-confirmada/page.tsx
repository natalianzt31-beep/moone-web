"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { RequireAuth } from "@/components/RequireAuth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter, WHATSAPP_URL } from "@/lib/site-config";

type ReservaConfirmada = {
  fecha_retiro: string;
  fecha_devolucion: string;
  senia: number;
  products: { nombre: string; talle: string | null } | null;
};

const MAX_INTENTOS = 6;

function ReservaConfirmadaContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");
  const status = searchParams.get("status") ?? searchParams.get("collection_status");

  const [reserva, setReserva] = useState<ReservaConfirmada | null>(null);
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
        .select("reservations(fecha_retiro, fecha_devolucion, senia, products(nombre, talle))")
        .eq("mp_payment_id", paymentId)
        .maybeSingle();

      if (cancelled) return;

      const encontrada = (
        data as unknown as { reservations: ReservaConfirmada | null } | null
      )?.reservations;

      if (encontrada) {
        setReserva(encontrada);
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

  const mensajeWhatsapp = reserva
    ? `Hola! Ya pagué la seña de mi reserva: ${reserva.products?.nombre ?? "Prenda"}${
        reserva.products?.talle ? ` (talle ${reserva.products.talle})` : ""
      }. Retiro: ${reserva.fecha_retiro}, devolución: ${reserva.fecha_devolucion}.`
    : "";

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
        {reserva ? "¡Reserva confirmada!" : "Estamos confirmando tu pago"}
      </h1>

      {loading ? (
        <p className="mt-4 text-sm text-taupe">Consultando el estado de tu pago...</p>
      ) : reserva ? (
        <>
          <div className="mt-6 rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
            <p className="text-base font-medium text-negro">
              {reserva.products?.nombre ?? "Prenda"}
            </p>
            <div className="mt-4 flex flex-col gap-2 border-t border-arena pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-chocolate">Retiro</span>
                <span className="text-negro">{reserva.fecha_retiro}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-chocolate">Devolución</span>
                <span className="text-negro">{reserva.fecha_devolucion}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-negro">Seña pagada</span>
                <span className="text-negro">{currencyFormatter.format(reserva.senia)}</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-chocolate">
            Tu reserva ya quedó confirmada. Si querés, te dejamos el contrato y los datos por
            WhatsApp — no hace falta que respondas nada para que la reserva quede en pie.
          </p>
          <a
            href={`${WHATSAPP_URL}?text=${encodeURIComponent(mensajeWhatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex min-h-11 w-fit items-center rounded-[3px] border border-negro px-6 text-sm font-medium text-negro transition-colors hover:border-chocolate hover:text-chocolate"
          >
            Ver contrato y datos por WhatsApp
          </a>
        </>
      ) : status === "rejected" ? (
        <p className="mt-4 text-sm text-chocolate">
          El pago no se pudo procesar y no se generó ninguna reserva. Podés volver a intentarlo
          desde la ficha de la prenda.
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
