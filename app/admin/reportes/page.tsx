"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import type { EstadoReserva } from "@/lib/supabase/types";

type ReservaReporte = {
  id: string;
  fecha_retiro: string;
  fecha_devolucion: string;
  estado: EstadoReserva;
  precio_total: number;
  medio_pago: string | null;
  products: { nombre: string } | null;
  clients: { nombre: string; celular: string | null } | null;
};

const MEDIO_PAGO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercado_pago: "Mercado Pago",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function ReportesContent() {
  const [reservas, setReservas] = useState<ReservaReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await getSupabaseClient()
          .from("reservations")
          .select("*, products(nombre), clients(nombre, celular)")
          .order("fecha_retiro", { ascending: true });

        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setReservas((data ?? []) as ReservaReporte[]);
        }
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
  }, []);

  if (loading) return <p className="mt-8 text-sm text-taupe">Cargando reportes...</p>;
  if (error) return <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>;

  const today = todayISO();

  const salenHoy = reservas.filter(
    (r) => r.fecha_retiro === today && r.estado !== "cancelado"
  );

  const vuelvenPendientes = reservas.filter(
    (r) => r.fecha_devolucion <= today && !["devuelto", "cancelado"].includes(r.estado)
  );

  const pagosPorMedio = reservas
    .filter((r) => r.estado !== "cancelado")
    .reduce<Record<string, { cantidad: number; total: number }>>((acc, r) => {
      const key = r.medio_pago ?? "sin_registrar";
      if (!acc[key]) acc[key] = { cantidad: 0, total: 0 };
      acc[key].cantidad += 1;
      acc[key].total += r.precio_total;
      return acc;
    }, {});

  return (
    <div className="flex flex-col gap-10">
      <ReporteSeccion
        titulo="Salen hoy"
        vacio="Ninguna prenda sale hoy."
        reservas={salenHoy}
        fechaLabel="fecha_retiro"
      />

      <ReporteSeccion
        titulo="Vuelven hoy / pendientes"
        vacio="No hay devoluciones pendientes."
        reservas={vuelvenPendientes}
        fechaLabel="fecha_devolucion"
      />

      <section>
        <h2 className="text-lg font-normal tracking-tight text-negro">Pagos por medio</h2>
        {Object.keys(pagosPorMedio).length === 0 ? (
          <p className="mt-3 text-sm text-taupe">Todavía no hay reservas con pago registrado.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-[3px] border border-arena">
            <table className="min-w-full divide-y divide-arena">
              <thead className="bg-crema">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                    Medio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                    Reservas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-arena bg-blanco">
                {Object.entries(pagosPorMedio).map(([medio, { cantidad, total }]) => (
                  <tr key={medio}>
                    <td className="px-4 py-3 text-sm text-negro">
                      {medio === "sin_registrar" ? "Sin registrar" : MEDIO_PAGO_LABEL[medio]}
                    </td>
                    <td className="px-4 py-3 text-sm text-chocolate">{cantidad}</td>
                    <td className="px-4 py-3 text-sm text-negro">
                      {currencyFormatter.format(total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ReporteSeccion({
  titulo,
  vacio,
  reservas,
  fechaLabel,
}: {
  titulo: string;
  vacio: string;
  reservas: ReservaReporte[];
  fechaLabel: "fecha_retiro" | "fecha_devolucion";
}) {
  return (
    <section>
      <h2 className="text-lg font-normal tracking-tight text-negro">{titulo}</h2>
      {reservas.length === 0 ? (
        <p className="mt-3 text-sm text-taupe">{vacio}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {reservas.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-1 rounded-[3px] border border-arena bg-blanco p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-negro">
                  {r.products?.nombre ?? "Prenda"}
                </p>
                <p className="text-sm text-taupe">
                  {r.clients?.nombre ?? "Clienta"} · {r.clients?.celular ?? ""}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wider text-taupe">
                {r[fechaLabel]}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminReportesPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Reportes
            </h1>
            <p className="mt-1 text-sm text-chocolate">Movimiento del día y pagos.</p>
            <div className="mt-8">
              <ReportesContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
