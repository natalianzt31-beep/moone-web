"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { horariosPosiblesPara } from "@/lib/citas";
import { addDays, toISODate } from "@/lib/disponibilidad";
import { AGENDA_MODISTA } from "@/lib/site-config";
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
  const [seleccionado, setSeleccionado] = useState<CitaModista | null>(null);

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
        filas
          .filter((fila) => fila.imagen_path)
          .map(async (fila) => {
            const { data: firmada } = await supabase.storage
              .from("citas-modista")
              .createSignedUrl(fila.imagen_path!, SIGNED_URL_SEGUNDOS);
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
        setSeleccionado(null);
      }
    } finally {
      setCancelandoId(null);
    }
  }

  // Todos los días hábiles de la modista (viernes/sábado) desde hoy y hasta
  // donde llega la agenda pública, para dibujar el bloque completo aunque
  // ese día todavía no tenga ningún turno cargado.
  const fechas = useMemo(() => {
    const hoy = toISODate(new Date());
    const resultado: string[] = [];
    for (let i = 0; i < AGENDA_MODISTA.semanasVisibles * 7; i++) {
      const fecha = addDays(hoy, i);
      if (horariosPosiblesPara(fecha).length > 0) resultado.push(fecha);
    }
    return resultado;
  }, []);

  const turnoPorSlot = useMemo(() => {
    const map = new Map<string, CitaModista>();
    for (const t of turnos) {
      if (t.estado === "confirmada") map.set(`${t.fecha}|${t.hora}`, t);
    }
    return map;
  }, [turnos]);

  const canceladas = useMemo(
    () => turnos.filter((t) => t.estado === "cancelada"),
    [turnos]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <div>
        <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
          Turnos con la modista
        </h1>
        <p className="mt-1 text-sm text-chocolate">
          Viernes de 14 a 18 y sábados de 10 a 18, turnos de media hora. Tocá un turno ocupado
          para ver los datos de la clienta y la foto.
        </p>
      </div>

      {loading && <p className="mt-8 text-sm text-taupe">Cargando turnos...</p>}

      {!loading && error && (
        <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
      )}

      {!loading && !error && (
        <div className="mt-6 flex flex-col gap-4">
          {fechas.map((fecha) => (
            <div key={fecha} className="rounded-[3px] border border-arena bg-blanco p-4">
              <p className="text-sm font-medium capitalize text-negro">{formatFecha(fecha)}</p>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {horariosPosiblesPara(fecha).map((hora) => {
                  const turno = turnoPorSlot.get(`${fecha}|${hora}`);
                  return (
                    <button
                      key={hora}
                      type="button"
                      disabled={!turno}
                      onClick={() => turno && setSeleccionado(turno)}
                      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[3px] px-1 py-1.5 text-center transition-colors ${
                        turno
                          ? "bg-negro text-blanco hover:bg-chocolate"
                          : "border border-arena bg-crema text-taupe/70"
                      }`}
                    >
                      <span className="text-xs font-medium">{hora}</span>
                      {turno && (
                        <span className="line-clamp-1 w-full text-[10px] leading-tight">
                          {turno.nombre}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setMostrarCanceladas((v) => !v)}
              className="flex min-h-11 items-center text-xs font-medium uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
            >
              {mostrarCanceladas ? "Ocultar" : "Ver"} turnos cancelados ({canceladas.length})
            </button>

            {mostrarCanceladas && (
              <div className="mt-3 flex flex-col gap-2">
                {canceladas.length === 0 && (
                  <p className="text-sm text-taupe">No hay turnos cancelados.</p>
                )}
                {canceladas.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSeleccionado(t)}
                    className="flex items-center justify-between gap-4 rounded-[3px] border border-arena bg-crema px-4 py-3 text-left opacity-70 transition-opacity hover:opacity-100"
                  >
                    <span className="text-sm text-negro">
                      {formatFechaCorta(t.fecha)} · {t.hora} — {t.nombre}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-taupe">Cancelado</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {seleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-negro/60 p-4"
          onClick={() => setSeleccionado(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-[3px] bg-blanco p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-taupe capitalize">
                  {formatFecha(seleccionado.fecha)}
                </p>
                <p className="text-lg font-medium text-negro">{seleccionado.hora}</p>
              </div>
              <button
                type="button"
                onClick={() => setSeleccionado(null)}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-taupe transition-colors hover:text-chocolate"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[3px] border border-arena bg-crema">
              {imagenes[seleccionado.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagenes[seleccionado.id]}
                  alt={`Referencia de ${seleccionado.nombre}`}
                  className="max-h-80 w-full object-contain"
                />
              ) : (
                <p className="flex h-32 items-center justify-center text-xs text-taupe">
                  Sin imagen
                </p>
              )}
            </div>

            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-taupe">Nombre</dt>
                <dd className="text-negro">{seleccionado.nombre}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-taupe">Fiesta</dt>
                <dd className="text-chocolate">{formatFechaCorta(seleccionado.fecha_fiesta)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-taupe">Mail</dt>
                <dd className="text-chocolate">
                  <a
                    href={`mailto:${seleccionado.email}`}
                    className="hover:text-negro hover:underline"
                  >
                    {seleccionado.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-taupe">Celular</dt>
                <dd className="text-chocolate">
                  <a
                    href={whatsappLink(seleccionado.celular)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-negro hover:underline"
                  >
                    {seleccionado.celular}
                  </a>
                </dd>
              </div>
            </dl>

            {seleccionado.estado === "confirmada" ? (
              <button
                type="button"
                onClick={() => cancelarTurno(seleccionado)}
                disabled={cancelandoId === seleccionado.id}
                className="mt-6 flex min-h-11 items-center justify-center rounded-[3px] border border-arena px-4 text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60"
              >
                {cancelandoId === seleccionado.id ? "Cancelando..." : "Cancelar turno"}
              </button>
            ) : (
              <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-taupe">
                Turno cancelado
              </p>
            )}
          </div>
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
