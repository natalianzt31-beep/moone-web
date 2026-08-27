import { Nav } from "@/components/Nav";

const ARTICULOS = ["Vestidos", "Monos", "Sandalias", "Carteras", "Tapados"];

export default function ColeccionPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Colección
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Elegí una categoría para ver las piezas disponibles.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ARTICULOS.map((articulo) => (
              <div
                key={articulo}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-center transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  {articulo}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
