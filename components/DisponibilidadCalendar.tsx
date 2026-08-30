"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { fetchClosedDatesSet } from "@/lib/supabase/closedDates";
import {
  addDays,
  getMonthMatrix,
  isDiaCerrado,
  sugerirDevolucion,
  toISODate,
} from "@/lib/disponibilidad";

type ReservaBloqueo = { fecha_retiro: string; fecha_devolucion: string };

export function DisponibilidadCalendar({
  productId,
  onSelect,
}: {
  productId: string;
  onSelect: (fechaRetiro: string | null, fechaDevolucion: string | null) => void;
}) {
  const [bloqueos, setBloqueos] = useState<ReservaBloqueo[]>([]);
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSelectedDay(null);
    setLoading(true);
    onSelect(null, null);

    async function load() {
      const [{ data: reservas }, closed] = await Promise.all([
        getSupabaseClient()
          .from("reservations")
          .select("fecha_retiro, fecha_devolucion")
          .eq("product_id", productId)
          .neq("estado", "cancelado")
          .neq("estado", "devuelto"),
        fetchClosedDatesSet(),
      ]);

      if (!cancelled) {
        setBloqueos((reservas ?? []) as ReservaBloqueo[]);
        setClosedDates(closed);
        setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const bloqueadosSet = useMemo(() => {
    const set = new Set<string>();
    for (const bloqueo of bloqueos) {
      let cursor = bloqueo.fecha_retiro;
      while (cursor <= bloqueo.fecha_devolucion) {
        set.add(cursor);
        cursor = addDays(cursor, 1);
      }
    }
    return set;
  }, [bloqueos]);

  const hoy = toISODate(new Date());

  const meses = useMemo(() => {
    const now = new Date();
    return [0, 1].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  function handleSelect(iso: string) {
    const nueva = selectedDay === iso ? null : iso;
    setSelectedDay(nueva);
    onSelect(nueva, nueva ? sugerirDevolucion(nueva, closedDates) : null);
  }

  return (
    <div className="flex flex-col gap-4 rounded-[3px] border border-arena bg-blanco p-3">
      {loading ? (
        <p className="text-sm text-taupe">Cargando disponibilidad...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {meses.map(({ year, month }) => {
            const weeks = getMonthMatrix(year, month);
            const nombreMes = new Date(year, month, 1).toLocaleDateString("es-UY", {
              month: "long",
              year: "numeric",
            });
            return (
              <div key={`${year}-${month}`}>
                <p className="text-center text-xs font-medium uppercase tracking-wider text-taupe capitalize">
                  {nombreMes}
                </p>
                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-taupe">
                  {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {weeks.flat().map((date, i) => {
                    const iso = toISODate(date);
                    const inMonth = date.getMonth() === month;
                    const isPast = iso < hoy;
                    const isBlocked = bloqueadosSet.has(iso);
                    const isCerrado = !isBlocked && isDiaCerrado(iso, closedDates);
                    const isSelected = selectedDay === iso;
                    const disabled = !inMonth || isPast || isBlocked || isCerrado;

                    return (
                      <button
                        key={`${iso}-${i}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSelect(iso)}
                        title={
                          isBlocked ? "No disponible" : isCerrado ? "Local cerrado" : undefined
                        }
                        className={`flex aspect-square items-center justify-center rounded-[3px] border text-xs transition-colors ${
                          !inMonth
                            ? "border-transparent text-transparent"
                            : isSelected
                              ? "border-negro bg-negro text-blanco"
                              : isBlocked
                                ? "border-arena bg-crema text-taupe line-through"
                                : isCerrado
                                  ? "border-arena bg-crema text-taupe/50"
                                  : isPast
                                    ? "border-arena bg-crema text-taupe/50"
                                    : "border-arena bg-blanco text-negro hover:border-chocolate cursor-pointer"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDay ? (
        <p className="text-sm text-chocolate">
          Retiro: <span className="font-medium text-negro">{selectedDay}</span> · Devolución
          sugerida:{" "}
          <span className="font-medium text-negro">
            {sugerirDevolucion(selectedDay, closedDates)}
          </span>
        </p>
      ) : (
        !loading && (
          <p className="text-xs text-taupe">
            Elegí un día disponible para retirar la prenda. Los días tachados ya están
            reservados; los domingos y feriados aparecen atenuados porque el local no abre.
          </p>
        )
      )}
    </div>
  );
}
