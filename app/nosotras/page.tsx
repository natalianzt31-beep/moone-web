import { Nav } from "@/components/Nav";
import {
  DIRECCION,
  EMAIL_CONTACTO,
  MAPS_EMBED_SRC,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site-config";

const EQUIPO = [
  {
    nombre: "Natalia Núñez Tricarico",
    rol: "Fundadora",
    fotoUrl: "/images/equipo/natalia.jpg" as string | null,
    linkedin: "https://www.linkedin.com/in/natalia-nuñez-tricarico-69129b109",
  },
  { nombre: null, rol: null, fotoUrl: null as string | null, linkedin: null },
  { nombre: null, rol: null, fotoUrl: null as string | null, linkedin: null },
];

export default function NosotrasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Nosotras
          </h1>
          <p className="mt-4 text-base leading-7 text-chocolate">
            Môone nace para que vivas cada ocasión especial con una prenda
            distinta, sin necesidad de comprarla. Seleccionamos vestidos,
            monos, sandalias, carteras y tapados de diseño para que armes tu
            look ideal y lo devuelvas cuando termine la fiesta.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-8 sm:pb-16">
          <h2 className="text-lg font-normal tracking-tight text-negro sm:text-xl">
            El equipo
          </h2>
          <p className="mt-1 text-sm text-chocolate">
            Las mujeres que hacemos Môone realidad.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 sm:mt-8 sm:gap-6">
            {EQUIPO.map((persona, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border border-arena bg-crema p-2">
                  {persona.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={persona.fotoUrl}
                      alt={persona.nombre ?? ""}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-taupe sm:text-xs">
                      Foto próximamente
                    </span>
                  )}
                </div>
                {persona.nombre && (
                  <div>
                    <p className="text-sm font-medium text-negro">{persona.nombre}</p>
                    {persona.rol && (
                      <p className="text-xs uppercase tracking-wider text-taupe">
                        {persona.rol}
                      </p>
                    )}
                    {persona.linkedin && (
                      <a
                        href={persona.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block min-h-11 text-xs text-taupe underline-offset-2 transition-colors hover:text-chocolate hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="contacto" className="bg-crema">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
            <h2 className="text-lg font-normal tracking-tight text-negro sm:text-xl">
              Visitanos
            </h2>

            <div className="mt-6 grid gap-8 sm:mt-8 sm:grid-cols-2">
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
