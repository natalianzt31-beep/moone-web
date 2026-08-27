import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Vestí un momento único.
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Alquilá vestidos, monos, sandalias, carteras y tapados de diseño
            para tu próximo evento. Reservá online y retirá en Punta
            Carretas.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/coleccion"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ver colección
            </Link>
            <Link
              href="/nosotras"
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500"
            >
              Conocenos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
