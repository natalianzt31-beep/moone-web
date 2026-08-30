"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { fetchClosedDates } from "@/lib/supabase/closedDates";
import { toISODate } from "@/lib/disponibilidad";
import type { ClosedDate } from "@/lib/supabase/types";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

function FeriadosContent() {
  const [fechas, setFechas] = useState<ClosedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nuevaFecha, setNuevaFecha] = useState(toISODate(new Date()));
  const [nuevoMotivo, setNuevoMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClosedDates();
      setFechas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const { error: insertError } = await getSupabaseClient()
        .from("closed_dates")
        .insert({ fecha: nuevaFecha, motivo: nuevoMotivo || null });

      if (insertError) {
        setError(
          insertError.code === "23505"
            ? "Esa fecha ya está cargada."
            : insertError.message
        );
        return;
      }

      setNuevoMotivo("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const { error: deleteError } = await getSupabaseClient()
        .from("closed_dates")
        .delete()
        .eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setFechas((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-normal tracking-tight text-negro">Agregar día cerrado</h2>
        <p className="mt-1 text-sm text-chocolate">
          Los domingos ya están cerrados siempre; acá solo hace falta cargar feriados o
          cierres puntuales.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-negro">
            Fecha
            <input
              type="date"
              required
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-negro">
            Motivo
            <input
              type="text"
              value={nuevoMotivo}
              onChange={(e) => setNuevoMotivo(e.target.value)}
              placeholder="Ej: Navidad"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm text-chocolate">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Agregar"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-normal tracking-tight text-negro">Días cerrados</h2>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-taupe">Cargando...</p>
          ) : fechas.length === 0 ? (
            <p className="text-sm text-taupe">No hay feriados cargados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {fechas.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-4 rounded-[3px] border border-arena bg-blanco px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-negro">{f.fecha}</p>
                    {f.motivo && <p className="text-xs text-taupe">{f.motivo}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    disabled={deletingId === f.id}
                    className="flex min-h-11 items-center justify-center rounded-[3px] border border-arena px-4 text-center text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60"
                  >
                    {deletingId === f.id ? "Borrando..." : "Borrar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AdminFeriadosPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Feriados
            </h1>
            <p className="mt-1 text-sm text-chocolate">
              Días en los que el local no abre, además de los domingos.
            </p>
            <div className="mt-8">
              <FeriadosContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
