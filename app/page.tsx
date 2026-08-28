import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { DIRECCION } from "@/lib/site-config";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24">
          <div className="flex flex-col items-start gap-5 sm:gap-6">
            <h1 className="text-3xl font-normal tracking-tight text-negro sm:text-4xl lg:text-5xl">
              Vestí un momento único.
            </h1>
            <p className="max-w-xl text-base leading-7 text-chocolate sm:text-lg sm:leading-8">
              Alquilá vestidos, monos, sandalias, carteras y tapados de
              diseño para tu próximo evento. Reservá online y retirá en
              Punta Carretas.
            </p>
            <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:gap-4">
              <Link
                href="/coleccion"
                className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] bg-negro px-6 py-3 text-center text-sm font-medium text-blanco transition-colors hover:bg-chocolate sm:flex-none"
              >
                Ver colección
              </Link>
              <Link
                href="/nosotras"
                className="flex min-h-11 flex-1 items-center justify-center rounded-[3px] border border-negro px-6 py-3 text-center text-sm font-medium text-negro transition-colors hover:border-chocolate hover:text-chocolate sm:flex-none"
              >
                Conocenos
              </Link>
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[3px] border border-arena">
            <Image
              src="/tienda.jpg"
              alt="Interior de Môone Rental Boutique"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="bg-crema">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:justify-between sm:gap-8 sm:px-8 sm:py-12">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-taupe">
                Dirección
              </h2>
              <p className="mt-1 text-base text-negro">{DIRECCION}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-taupe">
                Horario
              </h2>
              <p className="mt-1 text-base text-negro">Lunes a viernes de 14 a 20hs</p>
              <p className="text-base text-negro">Sábados de 10 a 16hs</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
