import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { DIRECCION } from "@/lib/site-config";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <h1 className="text-4xl font-normal tracking-tight text-negro sm:text-5xl">
              Vestí un momento único.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-chocolate">
              Alquilá vestidos, monos, sandalias, carteras y tapados de
              diseño para tu próximo evento. Reservá online y retirá en
              Punta Carretas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/coleccion"
                className="rounded-[3px] bg-negro px-6 py-3 text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
              >
                Ver colección
              </Link>
              <Link
                href="/nosotras"
                className="rounded-[3px] border border-negro px-6 py-3 text-sm font-medium text-negro transition-colors hover:border-chocolate hover:text-chocolate"
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
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:justify-between sm:px-8">
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
