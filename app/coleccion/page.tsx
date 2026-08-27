import Image from "next/image";
import { Nav } from "@/components/Nav";

const ARTICULOS: { nombre: string; foto: string | null }[] = [
  { nombre: "Vestidos", foto: "/coleccion/vestidos.jpg" },
  { nombre: "Monos", foto: null },
  { nombre: "Sandalias", foto: "/coleccion/sandalias.jpg" },
  { nombre: "Carteras", foto: "/coleccion/carteras.jpg" },
  { nombre: "Tapados", foto: "/coleccion/tapados.jpg" },
];

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

          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {ARTICULOS.map(({ nombre, foto }) => (
              <div key={nombre} className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena bg-blanco transition-colors hover:border-chocolate">
                  {foto ? (
                    <Image
                      src={foto}
                      alt={nombre}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-crema">
                      <span className="text-xs uppercase tracking-wider text-taupe">
                        Próximamente
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-center text-sm font-medium uppercase tracking-wider text-negro">
                  {nombre}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
