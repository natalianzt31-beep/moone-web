"use client";

import { useState } from "react";

/** Aclara junto al filtro de color que agrupamos tonos parecidos bajo un color principal. */
export function ColorFilterHint() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Cómo agrupamos los colores"
        aria-expanded={abierto}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-taupe text-[11px] text-taupe transition-colors hover:border-chocolate hover:text-chocolate"
      >
        ?
      </button>
      {abierto && (
        <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-[3px] border border-arena bg-blanco p-3 text-xs leading-relaxed text-chocolate shadow-sm">
          Agrupamos tonos parecidos bajo un color principal (por ejemplo, lila y violeta, o rosa
          viejo y rosa) para que el filtro no tenga una opción por cada tono. Elegí el color
          principal y vas a encontrar esos tonos también.
        </div>
      )}
    </div>
  );
}
