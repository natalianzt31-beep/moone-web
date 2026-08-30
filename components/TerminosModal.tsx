"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

const CHECKBOX_1_ACEPTADO = true; // este punto no se puede destildar

export function TerminosModal({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const { refreshClient } = useAuth();
  const [fotosAutorizadas, setFotosAutorizadas] = useState(true);
  const [mostrarTooltip, setMostrarTooltip] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleIntentoDestildar() {
    setMostrarTooltip(true);
    window.setTimeout(() => setMostrarTooltip(false), 2000);
  }

  async function handleConfirmar() {
    setGuardando(true);
    setError(null);

    try {
      const { error } = await getSupabaseClient()
        .from("clients")
        .update({
          terminos_aceptados: true,
          terminos_aceptados_fecha: new Date().toISOString(),
          fotos_autorizadas: fotosAutorizadas,
        })
        .eq("id", clientId);

      if (error) {
        setError(error.message);
        return;
      }

      await refreshClient();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-[3px] bg-blanco p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-normal tracking-tight text-negro sm:text-xl">
            Antes de continuar
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-taupe transition-colors hover:text-chocolate"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm text-chocolate">
          Al usar los servicios de Môone, aceptás:
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div className="relative">
            <label className="flex items-start gap-3 text-sm leading-relaxed text-negro">
              <input
                type="checkbox"
                checked={CHECKBOX_1_ACEPTADO}
                onChange={handleIntentoDestildar}
                className="mt-0.5 h-5 w-5 shrink-0 accent-negro"
              />
              <span>
                Cuidar la prenda alquilada como propia, devolverla en la fecha y horario
                acordados, avisar de inmediato ante cualquier mancha, rotura o daño y hacerme
                cargo del costo de reparación o limpieza especial que corresponda, y —en caso
                de pérdida o daño irreparable— abonar el valor de reposición de la prenda.
                Entiendo que la seña abonada corresponde a la prenda reservada, que queda
                retirada de disponibilidad para esas fechas específicas; si no retiro la
                prenda, la seña queda como saldo a favor en mi cuenta para una futura ocasión,
                y si aviso con anticipación puede usarse para cambiar el vestido señado por
                otro.
              </span>
            </label>
            {mostrarTooltip && (
              <div className="absolute left-8 top-full z-10 mt-1 rounded-[3px] bg-negro px-3 py-1.5 text-xs text-blanco shadow-sm">
                Este punto es necesario para reservar
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm leading-relaxed text-negro">
            <input
              type="checkbox"
              checked={fotosAutorizadas}
              onChange={(e) => setFotosAutorizadas(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-negro"
            />
            <span>
              Autorizo a Môone a utilizar, sin cargo, las fotos que envíe usando la prenda (si
              decido compartirlas) en las redes sociales y comunicaciones de la marca.
            </span>
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-chocolate">Error al guardar: {error}</p>}

        <button
          type="button"
          onClick={handleConfirmar}
          disabled={guardando || !CHECKBOX_1_ACEPTADO}
          className="mt-6 flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
