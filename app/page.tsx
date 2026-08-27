import Link from "next/link";

const DIRECCION =
  "Prudencio Vázquez y Vega 887 esq. Sarmiento, Punta Carretas, Montevideo";
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  `${DIRECCION}, Uruguay`
)}&output=embed`;
const WHATSAPP_URL = "https://wa.me/59893787376";
const EMAIL_CONTACTO = "contacto@moone.com.uy";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Môone
          </span>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/stock" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Stock
            </Link>
            <a href="#contacto" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Visitanos
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribinos por WhatsApp"
              className="text-[#25D366] hover:opacity-80"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.463 3.488A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
              </svg>
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

              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Email
                </h2>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  <a
                    href={`mailto:${EMAIL_CONTACTO}`}
                    className="hover:underline"
                  >
                    {EMAIL_CONTACTO}
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  WhatsApp
                </h2>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    093 787 376
                  </a>
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
