"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const RUTAS_OCULTAS = ["/admin", "/turnos"];

/** Banner fijo (no se puede cerrar) que invita a agendar un turno con la modista. */
export function ModistaBanner() {
  const pathname = usePathname();

  if (RUTAS_OCULTAS.some((ruta) => pathname.startsWith(ruta))) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 animate-[egresadas-in_0.4s_ease-out] sm:bottom-6 sm:right-6">
      <Link
        href="/turnos"
        className="max-w-[190px] rounded-2xl rounded-br-sm bg-negro px-4 py-2.5 text-right text-xs leading-snug text-blanco shadow-lg transition-transform hover:scale-[1.02] sm:max-w-[210px]"
      >
        ¿Querés un vestido a medida?{" "}
        <span className="font-medium">Agendate y lo creamos juntas.</span>
      </Link>

      <Link
        href="/turnos"
        aria-label="¿Querés un vestido a medida? Agendate con nuestra modista, en colaboración con Victoria Vidarte"
        className="block h-20 w-20 overflow-hidden rounded-full shadow-lg ring-1 ring-arena transition-transform hover:scale-105 sm:h-24 sm:w-24"
      >
        <Image
          src="/modista-banner.png"
          alt="Victoria Vidarte × Môone — Vestido a medida"
          width={192}
          height={192}
          className="h-full w-full object-cover"
        />
      </Link>
    </div>
  );
}
