import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import { PronoviasForm } from "@/app/pronovias/PronoviasForm";

export const metadata: Metadata = {
  title: "Pronovias × Cecilia Méndez — Alta Costura",
  description:
    "Probate vestidos de novia Pronovias (Barcelona) con la asesoría de Cecilia Méndez — Alta Costura, en el atelier de Victoria Vidarte en Môone. Cupos muy limitados, dejanos tus datos.",
  alternates: { canonical: "/pronovias" },
};

const FLYERS = [
  { src: "/pronovias/flyer-1.jpg", alt: "Pronovias Barcelona × Cecilia Méndez Alta Costura, de la mano de Môone" },
  {
    src: "/pronovias/flyer-2.jpg",
    alt: "Por primera vez en Montevideo: Pronovias Barcelona, viernes 13 de noviembre en Prudencio Vázquez y Vega 887",
  },
  { src: "/pronovias/flyer-3.jpg", alt: "Reservá tu prueba, cupos muy limitados" },
];

export default function PronoviasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {FLYERS.map((flyer) => (
              <div
                key={flyer.src}
                className="relative aspect-[4/5] overflow-hidden rounded-[3px] border border-arena"
              >
                <Image
                  src={flyer.src}
                  alt={flyer.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-taupe">
              Edición limitada en Montevideo · Cupos muy limitados
            </p>
            <h1 className="text-2xl font-normal tracking-tight text-negro sm:text-3xl">
              Pronovias Barcelona × Cecilia Méndez —{" "}
              <em className="font-normal not-italic text-chocolate">Alta Costura</em>
            </h1>
            <p className="text-base leading-7 text-chocolate">
              Cecilia Méndez — Alta Costura trae a Montevideo los modelos más icónicos de
              Pronovias, de Barcelona, con más de 100 años vistiendo novias.
            </p>
            <p className="text-base leading-7 text-chocolate">
              La prueba es con la asesoría personalizada de Cecilia, en el atelier de Victoria
              Vidarte en Môone, Prudencio Vázquez y Vega 887 esq. Sarmiento.
            </p>
            <p className="text-base leading-7 text-chocolate">
              Dejanos tus datos y te escribimos por WhatsApp para coordinar el día y el horario de
              tu prueba.
            </p>

            <div className="mt-2 rounded-[3px] border border-arena bg-blanco p-6 sm:p-8">
              <PronoviasForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
