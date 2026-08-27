import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { CATEGORIAS } from "@/lib/site-config";

const FOTOS: Record<string, string> = {
  vestidos: "/images/categorias/vestidos.jpg",
  monos: "/images/categorias/monos.jpg",
  sandalias: "/images/categorias/sandalias.jpg",
  carteras: "/images/categorias/carteras.jpg",
  tapados: "/images/categorias/tapados.jpg",
};

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
            {CATEGORIAS.map(({ slug, label }) => (
              <Link key={slug} href={`/coleccion/${slug}`} className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena bg-blanco transition-colors hover:border-chocolate">
                  <Image
                    src={FOTOS[slug]}
                    alt={label}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <span className="text-center text-sm font-medium uppercase tracking-wider text-negro">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
