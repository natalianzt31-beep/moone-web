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

export default function PronoviasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24">
          <div className="flex flex-col items-start gap-5 sm:gap-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-taupe">
              Edición limitada en Montevideo · Cupos muy limitados
            </p>
            <h1 className="text-3xl font-normal tracking-tight text-negro sm:text-4xl">
              Pronovias Barcelona ×{" "}
              <em className="font-normal not-italic text-chocolate">Cecilia Méndez</em>
            </h1>
            <p className="max-w-xl text-base leading-7 text-chocolate sm:text-lg sm:leading-8">
              Cecilia Méndez — Alta Costura trae a Montevideo los modelos más icónicos de
              Pronovias, de Barcelona, con más de 100 años vistiendo novias.
            </p>
            <p className="max-w-xl text-base leading-7 text-chocolate">
              La prueba es con la asesoría personalizada de Cecilia, en el atelier de Victoria
              Vidarte en Môone, Prudencio Vázquez y Vega 887 esq. Sarmiento.
            </p>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[3px] border border-arena">
            <Image
              src="/pronovias/foto-1.jpg"
              alt="Vestido de novia Pronovias con bordado floral"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="bg-crema">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-8 sm:gap-6 sm:px-8 sm:py-12">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena">
              <Image
                src="/pronovias/foto-2.jpg"
                alt="Espalda bordada de un vestido de novia Pronovias"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena">
              <Image
                src="/pronovias/foto-3.jpg"
                alt="Vestido de novia Pronovias de espalda descubierta"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
          <h2 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Reservá tu prueba
          </h2>
          <p className="mt-2 text-base leading-7 text-chocolate">
            Dejanos tus datos y te escribimos por WhatsApp para coordinar el día y el horario de
            tu prueba.
          </p>

          <div className="mt-6 rounded-[3px] border border-arena bg-blanco p-6 sm:p-8">
            <PronoviasForm />
          </div>
        </section>
      </main>
    </div>
  );
}
