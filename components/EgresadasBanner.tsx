"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DISMISS_KEY = "egresadas-banner-dismissed";
const RUTAS_OCULTAS = ["/admin", "/egresadas"];

export function EgresadasBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Sin acceso a localStorage (privado/bloqueado): mostramos igual.
    }
    setVisible(true);
  }, []);

  function cerrar() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // No hay forma de recordar el cierre — no es crítico.
    }
  }

  if (!visible || RUTAS_OCULTAS.some((ruta) => pathname.startsWith(ruta))) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-[egresadas-in_0.4s_ease-out] sm:bottom-6 sm:right-6">
      <div className="relative">
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-arena bg-blanco text-negro shadow-sm transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path
              d="M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>

        <Link
          href="/egresadas"
          aria-label="Tu vestido de egreso, en colaboración con Victoria Vidarte"
          className="block h-20 w-20 overflow-hidden rounded-full shadow-lg ring-1 ring-arena transition-transform hover:scale-105 sm:h-24 sm:w-24"
        >
          <Image
            src="/egresadas-banner.png"
            alt="Victoria Vidarte × Môone — Egresadas"
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        </Link>
      </div>
    </div>
  );
}
