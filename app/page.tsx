import Link from "next/link";

const DIRECCION =
  "Prudencio Vázquez y Vega 887 esq. Sarmiento, Punta Carretas, Montevideo";
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  `${DIRECCION}, Uruguay`
)}&output=embed`;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Môone
          </span>
          <nav className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/stock" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Stock
            </Link>
            <a href="#contacto" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Visitanos
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section
          id="contacto"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-8"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Visitanos
          </h1>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Dirección
                </h2>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  {DIRECCION}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Horario
                </h2>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  Lunes a viernes de 14 a 20hs
                </p>
                <p className="text-base text-zinc-800 dark:text-zinc-200">
                  Sábados de 10 a 16hs
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <iframe
                src={MAPS_EMBED_SRC}
                title="Mapa - Môone"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
