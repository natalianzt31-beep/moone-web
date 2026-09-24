"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EgresadaSubmission } from "@/lib/supabase/types";

/** Cuánto dura el link firmado de cada imagen (alcanza para una sesión de revisión). */
const SIGNED_URL_SEGUNDOS = 60 * 60;

function formatFecha(iso: string): string {
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

function EgresadasContent() {
  const [respuestas, setRespuestas] = useState<EgresadaSubmission[]>([]);
  const [imagenes, setImagenes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soloSinRevisar, setSoloSinRevisar] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("egresadas_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      const filas = (data ?? []) as EgresadaSubmission[];
      setRespuestas(filas);

      const urls = await Promise.all(
        filas.map(async (fila) => {
          const { data: firmada } = await supabase.storage
            .from("egresadas")
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

  async function toggleRevisado(fila: EgresadaSubmission) {
    setActualizandoId(fila.id);
    try {
      const { error } = await getSupabaseClient()
        .from("egresadas_submissions")
        .update({ revisado: !fila.revisado })
        .eq("id", fila.id);

      if (!error) {
        setRespuestas((prev) =>
          prev.map((r) => (r.id === fila.id ? { ...r, revisado: !r.revisado } : r))
        );
      }
    } finally {
      setActualizandoId(null);
    }
  }

  const respuestasFiltradas = useMemo(
    () => (soloSinRevisar ? respuestas.filter((r) => !r.revisado) : respuestas),
    [respuestas, soloSinRevisar]
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Diseñá tu vestido con nosotras
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Respuestas del formulario de egresadas (Victoria Vidarte × Môone).
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-negro">
          <input
            type="checkbox"
            checked={soloSinRevisar}
            onChange={(e) => setSoloSinRevisar(e.target.checked)}
          />
          Solo sin revisar
        </label>
      </div>

      {loading && <p className="mt-8 text-sm text-taupe">Cargando respuestas...</p>}

      {!loading && error && (
        <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>
      )}

      {!loading && !error && respuestasFiltradas.length === 0 && (
        <p className="mt-8 text-sm text-taupe">
          {soloSinRevisar ? "No quedan respuestas sin revisar." : "Todavía no hay respuestas."}
        </p>
      )}

      {!loading && !error && respuestasFiltradas.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {respuestasFiltradas.map((fila) => (
            <div
              key={fila.id}
              className={`flex flex-col gap-4 rounded-[3px] border p-4 sm:flex-row sm:p-6 ${
                fila.revisado ? "border-arena bg-blanco" : "border-negro bg-crema"
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
                    alt={`Inspiración de ${fila.nombre}`}
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
                    <p className="text-base font-medium text-negro">{fila.nombre}</p>
                    <p className="text-sm text-taupe">
                      {fila.liceo} · Graduación: {formatFecha(fila.graduacion)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRevisado(fila)}
                    disabled={actualizandoId === fila.id}
                    className={`flex min-h-11 items-center justify-center rounded-[3px] border px-3 text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-60 ${
                      fila.revisado
                        ? "border-arena text-taupe hover:border-chocolate hover:text-chocolate"
                        : "border-negro bg-negro text-blanco hover:bg-chocolate"
                    }`}
                  >
                    {fila.revisado ? "Revisada ✓" : "Marcar revisada"}
                  </button>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">Talle</dt>
                    <dd className="text-chocolate">{fila.talle}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">Color</dt>
                    <dd className="text-chocolate">{fila.color}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">Instagram</dt>
                    <dd className="text-chocolate">
                      <a
                        href={`https://instagram.com/${fila.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-negro hover:underline"
                      >
                        {fila.instagram}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-taupe">WhatsApp</dt>
                    <dd className="text-chocolate">
                      <a
                        href={whatsappLink(fila.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-negro hover:underline"
                      >
                        {fila.whatsapp}
                      </a>
                    </dd>
                  </div>
                </dl>

                {fila.gusta && (
                  <p className="mt-3 text-sm text-chocolate">
                    <span className="font-medium text-negro">Le gusta:</span> {fila.gusta}
                  </p>
                )}
                {fila.cambiaria && (
                  <p className="mt-1 text-sm text-chocolate">
                    <span className="font-medium text-negro">Cambiaría:</span> {fila.cambiaria}
                  </p>
                )}

                <p className="mt-3 text-xs text-taupe">
                  Enviado el {formatFecha(fila.created_at.slice(0, 10))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEgresadasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <EgresadasContent />
        </main>
      </RequireStaff>
    </div>
  );
}
