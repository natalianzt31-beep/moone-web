import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import { AgendaEventoForm } from "@/app/evento-cecilia-mendez/AgendaEventoForm";
import { DIRECCION } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Evento especial Cecilia Méndez × Pronovias",
  description:
    "El 13 de noviembre, Cecilia Méndez — Alta Costura prueba vestidos de novia Pronovias (Barcelona) en el atelier de Victoria Vidarte en Môone. Cupos limitados, agendá tu turno.",
  alternates: { canonical: "/evento-cecilia-mendez" },
};

export default function EventoCeciliaMendezPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="relative w-full overflow-hidden border-b border-arena bg-negro">
          <Image
            src="/eventos/cecilia-mendez-banner.jpg"
            alt="Cecilia Méndez — Alta Costura · www.ceciliamendez.uy"
            width={1125}
            height={336}
            className="h-auto w-full object-cover opacity-90"
            priority
          />
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-taupe">
              Evento especial · Cupos limitados
            </p>
            <h1 className="text-2xl font-normal tracking-tight text-negro sm:text-3xl">
              Probate vestidos de novia{" "}
              <em className="font-normal not-italic text-chocolate">Pronovias</em>
            </h1>
            <p className="text-base leading-7 text-chocolate">
              El <strong className="font-medium text-negro">viernes 13 de noviembre</strong>,{" "}
              <strong className="font-medium text-negro">Cecilia Méndez — Alta Costura</strong>{" "}
              viene desde Punta del Este a agendar clientas para probarse vestidos de la marca{" "}
              <strong className="font-medium text-negro">Pronovias</strong>, de Barcelona, que ella
              importa.
            </p>
            <p className="text-base leading-7 text-chocolate">
              Lo hará en el atelier de{" "}
              <strong className="font-medium text-negro">Victoria Vidarte</strong> en Môone,{" "}
              {DIRECCION}.
            </p>
            <p className="text-base leading-7 text-chocolate">
              Los cupos son limitados: turnos de una hora a partir de las{" "}
              <strong className="font-medium text-negro">13hs</strong>.
            </p>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena">
                <Image
                  src="/eventos/pronovias-vestido-1.jpg"
                  alt="Vestido de novia Pronovias, espalda con transparencia bordada"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena">
                <Image
                  src="/eventos/pronovias-vestido-2.jpg"
                  alt="Vestido de novia Pronovias, falda amplia con bolsillos"
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[3px] border border-arena bg-blanco p-6 sm:p-8">
            <h2 className="text-lg font-normal text-negro">Agendá tu turno</h2>
            <p className="mt-1 text-sm text-taupe">Un cupo por hora, de 13 a 20hs.</p>
            <div className="mt-6">
              <AgendaEventoForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
