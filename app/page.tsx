import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-8">
          <h1 className="text-4xl font-normal tracking-tight text-negro sm:text-5xl">
            Vestí un momento único.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-chocolate">
            Alquilá vestidos, monos, sandalias, carteras y tapados de diseño
            para tu próximo evento. Reservá online y retirá en Punta
            Carretas.
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
        </section>
      </main>
    </div>
  );
}
