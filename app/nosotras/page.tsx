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
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
          <h1 className="text-2xl font-normal tracking-tight text-negro">
            Nosotras
          </h1>
          <p className="mt-4 text-base leading-7 text-chocolate">
            Môone nace para que vivas cada ocasión especial con una prenda
            distinta, sin necesidad de comprarla. Seleccionamos vestidos,
            monos, sandalias, carteras y tapados de diseño para que armes tu
            look ideal y lo devuelvas cuando termine la fiesta.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
          <h2 className="text-xl font-normal tracking-tight text-negro">
            El equipo
          </h2>
          <p className="mt-1 text-sm text-chocolate">
            Las mujeres que hacemos Môone realidad.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className="flex aspect-square w-full items-center justify-center rounded-full border border-arena bg-crema">
                  <span className="text-xs uppercase tracking-wider text-taupe">
                    Foto próximamente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contacto" className="bg-crema">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
            <h2 className="text-xl font-normal tracking-tight text-negro">
              Visitanos
            </h2>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">
                    Dirección
                  </h3>
                  <p className="mt-1 text-base text-negro">{DIRECCION}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">
                    Horario
                  </h3>
                  <p className="mt-1 text-base text-negro">
                    Lunes a viernes de 14 a 20hs
                  </p>
                  <p className="text-base text-negro">Sábados de 10 a 16hs</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">
                    Email
                  </h3>
                  <p className="mt-1 text-base text-negro">
                    <a href={`mailto:${EMAIL_CONTACTO}`} className="hover:text-chocolate">
                      {EMAIL_CONTACTO}
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">
                    WhatsApp
                  </h3>
                  <p className="mt-1 text-base text-negro">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-chocolate"
                    >
                      {WHATSAPP_DISPLAY}
                    </a>
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[3px] border border-arena">
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
          </div>
        </section>
      </main>
    </div>
  );
}
