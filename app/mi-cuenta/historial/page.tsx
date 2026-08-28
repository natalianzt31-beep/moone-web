"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { MiCuentaNav } from "@/components/MiCuentaNav";
import { RequireAuth } from "@/components/RequireAuth";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { fetchReservations } from "@/lib/supabase/account";
import { currencyFormatter } from "@/lib/site-config";
import type { EstadoReserva, Reservation } from "@/lib/supabase/types";

const ESTADO_LABEL: Record<EstadoReserva, string> = {
  reservado: "Reservado",
  confirmado_retiro: "Confirmado para retiro",
  retirado: "Retirado",
  devuelto: "Devuelto",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

const ESTADO_BADGE: Record<EstadoReserva, string> = {
  reservado: "border border-taupe text-taupe",
  confirmado_retiro: "border border-chocolate text-chocolate",
  retirado: "bg-negro text-blanco",
  devuelto: "bg-crema text-taupe",
  vencido: "bg-chocolate text-blanco",
  cancelado: "bg-crema text-taupe",
};

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function HistorialContent() {
  const { client, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await fetchReservations(client!.id);
        if (!cancelled) setReservations(data);
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

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-16">
      <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
        Mi historial
      </h1>
      <p className="mt-1 text-sm text-chocolate">
        Tus reservas activas y pasadas.
      </p>

      {!authLoading && client && (
        <div className="mt-6">
          <LoyaltyCard completados={client.alquileres_completados} />
        </div>
      )}

      {(authLoading || loading) && (
        <p className="mt-8 text-sm text-taupe">Cargando reservas...</p>
      )}

      {!authLoading && !loading && !client && (
        <p className="mt-8 text-sm text-chocolate">
          No pudimos cargar tu cuenta. Probá cerrar sesión y volver a entrar.
        </p>
      )}

      {!authLoading && !loading && client && error && (
        <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
      )}

      {!authLoading && !loading && client && !error && reservations.length === 0 && (
        <p className="mt-8 text-sm text-taupe">
          Todavía no tenés reservas. Mirá la{" "}
          <a href="/coleccion" className="text-negro hover:text-chocolate">
            Colección
          </a>
          .
        </p>
      )}

      {!authLoading && !loading && client && !error && reservations.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-[3px] border border-arena bg-blanco p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div>
                <p className="text-base font-medium text-negro">
                  {r.products?.nombre ?? "Prenda"}
                </p>
                <p className="mt-1 text-sm text-taupe">
                  {formatDate(r.fecha_retiro)} — {formatDate(r.fecha_devolucion)}
                </p>
                <p className="mt-1 text-sm text-chocolate">
                  Total {currencyFormatter.format(r.precio_total)} · Seña{" "}
                  {currencyFormatter.format(r.senia)}
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-[3px] px-2.5 py-1 text-xs font-medium ${ESTADO_BADGE[r.estado]}`}
              >
                {ESTADO_LABEL[r.estado]}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HistorialPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <RequireAuth>
        <MiCuentaNav />
        <main className="flex-1">
          <HistorialContent />
        </main>
      </RequireAuth>
    </div>
  );
}
