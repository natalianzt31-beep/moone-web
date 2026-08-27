import { Nav } from "@/components/Nav";

const ARTICULOS = ["Vestidos", "Monos", "Sandalias", "Carteras", "Tapados"];

export default function ColeccionPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <h1 className="text-2xl font-normal tracking-tight text-negro">
            Colección
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Elegí una categoría para ver las piezas disponibles.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ARTICULOS.map((articulo) => (
              <div
                key={articulo}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[3px] border border-arena bg-blanco text-center transition-colors hover:border-chocolate"
              >
                <span className="text-base font-medium text-negro">
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
