"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { CitaModista } from "@/lib/supabase/types";

/** Cuánto dura el link firmado de cada imagen (alcanza para una sesión de revisión). */
const SIGNED_URL_SEGUNDOS = 60 * 60;

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
}

function formatFechaCorta(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function whatsappLink(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos.startsWith("598") ? digitos : `598${digitos.replace(/^0/, "")}`}`;
}

function TurnosContent() {
  const [turnos, setTurnos] = useState<CitaModista[]>([]);
  const [imagenes, setImagenes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("citas_modista")
        .select("*")
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true });

      if (error) {
        setError(error.message);
        return;
      }

      const filas = (data ?? []) as CitaModista[];
      setTurnos(filas);

      const urls = await Promise.all(
        filas.map(async (fila) => {
          const { data: firmada } = await supabase.storage
            .from("citas-modista")
            .createSignedUrl(fila.imagen_path, SIGNED_URL_SEGUNDOS);
          return [fila.id, firmada?.signedUrl ?? null] as const;
        })
      );
      setImagenes(Object.fromEntries(urls.filter(([, url]) => url) as [string, string][]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cancelarTurno(fila: CitaModista) {
    if (!confirm(`¿Cancelar el turno de ${fila.nombre} (${formatFechaCorta(fila.fecha)} ${fila.hora})?`)) {
      return;
    }
    setCancelandoId(fila.id);
    try {
      const { error } = await getSupabaseClient()
        .from("citas_modista")
        .update({ estado: "cancelada", cancelado_at: new Date().toISOString() })
        .eq("id", fila.id);

      if (!error) {
        setTurnos((prev) =>
          prev.map((t) => (t.id === fila.id ? { ...t, estado: "cancelada" } : t))
        );
      }
    } finally {
      setCancelandoId(null);
    }
  }

  const turnosFiltrados = useMemo(
    () => (mostrarCanceladas ? turnos : turnos.filter((t) => t.estado === "confirmada")),
    [turnos, mostrarCanceladas]
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Turnos con la modista
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Viernes de 14 a 18 y sábados de 10 a 18, turnos de media hora.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-negro">
          <input
            type="checkbox"
            checked={mostrarCanceladas}
            onChange={(e) => setMostrarCanceladas(e.target.checked)}
          />
          Mostrar canceladas
        </label>
      </div>

      {loading && <p className="mt-8 text-sm text-taupe">Cargando turnos...</p>}

      {!loading && error && (
        <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
      )}

      {!loading && !error && turnosFiltrados.length === 0 && (
        <p className="mt-8 text-sm text-taupe">
          {mostrarCanceladas ? "Todavía no hay turnos cargados." : "No hay turnos confirmados."}
        </p>
      )}

      {!loading && !error && turnosFiltrados.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {turnosFiltrados.map((fila) => (
            <div
              key={fila.id}
              className={`flex flex-col gap-4 rounded-[3px] border p-4 sm:flex-row sm:p-6 ${
                fila.estado === "cancelada" ? "border-arena bg-crema opacity-60" : "border-arena bg-blanco"
              }`}
            >
              <a
                href={imagenes[fila.id] ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-48 w-36 shrink-0 overflow-hidden rounded-[3px] border border-arena bg-blanco sm:h-56 sm:w-40"
              >
                {imagenes[fila.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagenes[fila.id]}
                    alt={`Referencia de ${fila.nombre}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-taupe">
                    Sin imagen
                  </span>
                )}
              </a>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-medium text-negro capitalize">
                      {formatFecha(fila.fecha)} · {fila.hora}
                    </p>
                    <p className="text-sm text-taupe">{fila.nombre}</p>
                  </div>
                  {fila.estado === "confirmada" ? (
                    <button
                      type="button"
                      onClick={() => cancelarTurno(fila)}
                      disabled={cancelandoId === fila.id}
                      className="flex min-h-11 items-center justify-center rounded-[3px] border border-arena px-3 text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60"
                    >
                      {cancelandoId === fila.id ? "Cancelando..." : "Cancelar"}
                    </button>
                  ) : (
                    <span className="flex min-h-11 items-center text-xs font-medium uppercase tracking-wider text-taupe">
                      Cancelado
                    </span>
                  )}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">Fiesta</dt>
                    <dd className="text-chocolate">{formatFechaCorta(fila.fecha_fiesta)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">Mail</dt>
                    <dd className="text-chocolate">
                      <a href={`mailto:${fila.email}`} className="hover:text-negro hover:underline">
                        {fila.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">Celular</dt>
                    <dd className="text-chocolate">
                      <a
                        href={whatsappLink(fila.celular)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-negro hover:underline"
                      >
                        {fila.celular}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTurnosPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <TurnosContent />
        </main>
      </RequireStaff>
    </div>
  );
}
