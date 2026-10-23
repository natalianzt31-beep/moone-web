import Image from "next/image";
import Link from "next/link";

/** Banner horizontal clásico en el home, promocionando /pronovias. */
export function PronoviasBanner() {
  return (
    <section className="bg-negro">
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row sm:items-stretch">
        <div className="flex flex-1 flex-col justify-center gap-3 px-4 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-dorado">
            Edición limitada en Montevideo
          </p>
          <h2 className="text-2xl font-normal tracking-tight text-blanco sm:text-3xl">
            Pronovias Barcelona ×{" "}
            <em className="font-normal not-italic text-arena">Cecilia Méndez</em>
          </h2>
          <p className="max-w-md text-sm leading-6 text-arena sm:text-base sm:leading-7">
            Probate los vestidos de novia más icónicos de Pronovias con la asesoría exclusiva de
            Cecilia Méndez — Alta Costura. Viernes 13 de noviembre, cupos muy limitados.
          </p>
          <Link
            href="/pronovias"
            className="mt-2 flex min-h-11 w-fit items-center justify-center rounded-[3px] bg-blanco px-6 text-sm font-medium text-negro transition-colors hover:bg-arena"
          >
            Quiero mi turno
          </Link>
        </div>

        <div className="relative h-48 w-full sm:h-auto sm:w-80 lg:w-96">
          <Image
            src="/pronovias/banner-foto.jpg"
            alt="Vestido de novia Pronovias"
            fill
            sizes="(min-width: 640px) 384px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
