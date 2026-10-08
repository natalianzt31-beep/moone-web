"use client";

import { useState } from "react";

type Estado = "idle" | "copiado" | "error";

/**
 * Comparte la URL actual: usa el share nativo del celular si está
 * disponible (Web Share API) y si no, copia el link al portapapeles.
 */
export function ShareButton({ title }: { title: string }) {
  const [estado, setEstado] = useState<Estado>("idle");

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // La persona canceló el share nativo — no es un error que mostrar.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setEstado("copiado");
      setTimeout(() => setEstado("idle"), 2000);
    } catch {
      setEstado("error");
      setTimeout(() => setEstado("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex min-h-11 items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path
          d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .09 1.74L8.6 9.49a3 3 0 1 0 0 5.02l6.49 3.75A3 3 0 1 0 15.83 16a3 3 0 0 0-2.77 1.84L6.57 14.1a3 3 0 0 0 0-4.2l6.49-3.75A3 3 0 0 0 18 8Z"
          fill="currentColor"
        />
      </svg>
      {estado === "copiado" ? "¡Link copiado!" : estado === "error" ? "No se pudo copiar" : "Compartir"}
    </button>
  );
}
