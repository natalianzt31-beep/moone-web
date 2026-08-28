const TOTAL = 6;

function VestidoIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-7 w-7 sm:h-8 sm:w-8 ${filled ? "text-negro" : "text-arena"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M9 2 L8 5 L4 21 L20 21 L16 5 L15 2 L9 2 Z" strokeLinejoin="round" />
      <path d="M9 2 C9 4 15 4 15 2" strokeLinejoin="round" />
    </svg>
  );
}

export function LoyaltyCard({ completados }: { completados: number }) {
  const enCiclo = completados > 0 && completados % TOTAL === 0 ? TOTAL : completados % TOTAL;

  return (
    <div className="rounded-[3px] border border-arena bg-blanco p-4 sm:p-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-taupe">
        Tarjeta de fidelidad
      </h2>

      <div className="mt-4 flex items-center justify-between gap-1 sm:gap-3">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <VestidoIcon key={i} filled={i < enCiclo} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs text-taupe">
        <p className={enCiclo >= 2 ? "font-medium text-chocolate" : ""}>
          2 alquileres = 25% OFF en tu 3er alquiler
        </p>
        <p className={enCiclo >= 4 ? "font-medium text-chocolate" : ""}>
          4 alquileres = 50% OFF en tu 6to alquiler
        </p>
      </div>

      <p className="mt-3 text-center text-xs text-taupe">
        Llevás {completados} {completados === 1 ? "alquiler completado" : "alquileres completados"}.
      </p>
    </div>
  );
}
