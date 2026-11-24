"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { ROLES_ADMIN_CAJA } from "@/lib/adminAccess";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import type { EstadoReserva } from "@/lib/supabase/types";

const MEDIO_PAGO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercado_pago: "Mercado Pago",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

const ESTADO_LABEL: Record<EstadoReserva, string> = {
  reservado: "Reservado",
  confirmado_retiro: "Confirmado",
  retirado: "Retirado",
  en_limpieza: "En limpieza",
  devuelto: "Devuelto",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

type ReservaActividad = {
  id: string;
  created_at: string;
  precio_total: number;
  medio_pago: string | null;
  estado: EstadoReserva;
  products: { sku: string; nombre: string } | null;
  clients: { nombre: string } | null;
};

/** created_at viene en UTC; agrupamos por fecha de Montevideo (UTC-3), no UTC. */
function diaKey(iso: string): string {
  const ajustada = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  return ajustada.toISOString().slice(0, 10);
}

function diaLabel(key: string): string {
  const texto = new Date(`${key}T12:00:00Z`).toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function horaLocal(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
}

function ActividadContent() {
  const [reservas, setReservas] = useState<ReservaActividad[]>([]);
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
          .select("id, created_at, precio_total, medio_pago, estado, products(sku, nombre), clients(nombre)")
          .order("created_at", { ascending: false });

        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setReservas((data ?? []) as unknown as ReservaActividad[]);
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

  if (loading) return <p className="mt-8 text-sm text-taupe">Cargando...</p>;
  if (error) return <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>;
  if (reservas.length === 0) {
    return <p className="mt-8 text-sm text-taupe">Todavía no hay reservas cargadas.</p>;
  }

  const porDia = new Map<string, ReservaActividad[]>();
  for (const r of reservas) {
    const key = diaKey(r.created_at);
    const grupo = porDia.get(key);
    if (grupo) grupo.push(r);
    else porDia.set(key, [r]);
  }
  const dias = Array.from(porDia.keys()).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="flex flex-col gap-10">
      {dias.map((dia) => {
        const items = porDia.get(dia)!;
        const totalDia = items
          .filter((r) => r.estado !== "cancelado")
          .reduce((suma, r) => suma + r.precio_total, 0);

        return (
          <section key={dia}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-normal tracking-tight text-negro">{diaLabel(dia)}</h2>
              <p className="text-sm text-chocolate">
                {items.length} {items.length === 1 ? "reserva" : "reservas"} ·{" "}
                {currencyFormatter.format(totalDia)}
              </p>
            </div>
            <div className="mt-3 overflow-x-auto rounded-[3px] border border-arena">
              <table className="min-w-full divide-y divide-arena">
                <thead className="bg-crema">
                  <tr>
                    {["Hora", "Clienta", "Prenda", "Monto", "Medio de pago", "Estado"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-arena bg-blanco">
                  {items.map((r) => (
                    <tr key={r.id} className={r.estado === "cancelado" ? "opacity-50" : ""}>
                      <td className="px-4 py-3 text-sm text-chocolate">{horaLocal(r.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-negro">{r.clients?.nombre ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-chocolate">
                        {r.products?.nombre ?? "Prenda"}
                        {r.products?.sku && <span className="text-taupe"> · {r.products.sku}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-negro">
                        {currencyFormatter.format(r.precio_total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-chocolate">
                        {r.medio_pago ? (MEDIO_PAGO_LABEL[r.medio_pago] ?? r.medio_pago) : "Sin registrar"}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-taupe">
                        {ESTADO_LABEL[r.estado]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function AdminActividadPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff roles={ROLES_ADMIN_CAJA}>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">Actividad</h1>
            <p className="mt-1 text-sm text-chocolate">
              Reservas cargadas por día (no por fecha de retiro), con el medio de pago de cada una.
            </p>
            <div className="mt-8">
              <ActividadContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
