"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EVENTO_CECILIA_MENDEZ } from "@/lib/site-config";

const RUTAS_OCULTAS = ["/admin", "/evento-cecilia-mendez"];

/** Banner superior sitewide que invita a agendar un turno para el evento Cecilia Méndez × Pronovias. Desaparece solo después de la fecha del evento. */
export function EventoCeciliaMendezBanner() {
  const pathname = usePathname();

  if (RUTAS_OCULTAS.some((ruta) => pathname.startsWith(ruta))) return null;

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Montevideo" });
  if (hoy > EVENTO_CECILIA_MENDEZ.fecha) return null;

  return (
    <Link
      href="/evento-cecilia-mendez"
      className="flex min-h-11 w-full items-center justify-center gap-2 bg-negro px-4 py-2 text-center text-xs font-medium text-blanco transition-colors hover:bg-chocolate sm:text-sm"
    >
      <span className="text-dorado">Cecilia Méndez × Pronovias</span>
      <span className="hidden sm:inline">
        · Probate vestidos de novia el {EVENTO_CECILIA_MENDEZ.etiquetaFecha.toLowerCase()}, cupos
        limitados
      </span>
      <span className="underline underline-offset-2">Agendar turno</span>
    </Link>
  );
}
