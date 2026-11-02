import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { EN_VENTA_SUBCATEGORIAS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "En Venta",
  description:
    "Prendas en venta definitiva en Môone, Montevideo: elegí una subcategoría para ver lo disponible.",
  alternates: { canonical: "/coleccion/en-venta" },
};

export default function EnVentaPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Colección", item: absoluteUrl("/coleccion") },
      {
        "@type": "ListItem",
        position: 3,
        name: "En Venta",
        item: absoluteUrl("/coleccion/en-venta"),
      },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <JsonLd data={breadcrumbJsonLd} />
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
          <Link
            href="/coleccion"
            className="flex min-h-11 w-fit items-center text-xs uppercase tracking-wider text-taupe transition-colors hover:text-chocolate"
          >
            ← Colección
          </Link>
          <h1 className="mt-1 text-xl font-normal tracking-tight text-negro sm:text-2xl">
            En Venta
          </h1>
          <p className="mt-1 text-sm text-chocolate">
            Prendas en venta definitiva — se abonan al 100%, no se alquilan. Elegí una
            subcategoría.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-6">
            {EN_VENTA_SUBCATEGORIAS.map(({ slug, label, portada }) => (
              <Link
                key={slug}
                href={`/coleccion/en-venta/${slug}`}
                className="flex flex-col gap-3"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-arena bg-blanco transition-colors hover:border-chocolate">
                  <Image
                    src={portada}
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
