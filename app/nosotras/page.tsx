import { Nav } from "@/components/Nav";
import {
  DIRECCION,
  EMAIL_CONTACTO,
  MAPS_EMBED_SRC,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site-config";

export default function NosotrasPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nosotras
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Môone nace para que vivas cada ocasión especial con una prenda
            distinta, sin necesidad de comprarla. Seleccionamos vestidos,
            monos, sandalias, carteras y tapados de diseño para que armes tu
            look ideal y lo devuelvas cuando termine la fiesta.
          </p>
        </section>

        <section id="contacto" className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Visitanos
          </h2>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Dirección
                </h3>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  {DIRECCION}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Horario
                </h3>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  Lunes a viernes de 14 a 20hs
                </p>
                <p className="text-base text-zinc-800 dark:text-zinc-200">
                  Sábados de 10 a 16hs
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Email
                </h3>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  <a href={`mailto:${EMAIL_CONTACTO}`} className="hover:underline">
                    {EMAIL_CONTACTO}
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  WhatsApp
                </h3>
                <p className="mt-1 text-base text-zinc-800 dark:text-zinc-200">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {WHATSAPP_DISPLAY}
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
