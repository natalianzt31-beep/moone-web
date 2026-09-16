import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { FormularioEgreso } from "@/app/egresadas/FormularioEgreso";

export const metadata: Metadata = {
  title: "Tu vestido de egreso × Victoria Vidarte",
  description:
    "Mandanos tu inspiración y contanos sobre vos: esta temporada creamos junto a Victoria Vidarte 10 vestidos de egreso a medida, en el color que elijas.",
  alternates: { canonical: "/egresadas" },
};

const BULLETS = [
  "Hechos a pedido",
  "En el color que elijas",
  "No repetimos el mismo vestido dentro de una misma fiesta",
  "El presupuesto depende del diseño y la tela elegida",
];

export default function EgresadasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-taupe">
            Victoria Vidarte × Môone
          </p>
          <h1 className="mt-2 text-2xl font-normal tracking-tight text-negro sm:text-3xl">
            Tu vestido de <em className="font-normal not-italic text-chocolate">egreso</em>
          </h1>
          <p className="mt-4 text-base leading-7 text-chocolate">
            Mandanos una foto, captura o referencia del vestido que te gustaría usar y contanos
            un poquito sobre vos. Esta temporada vamos a seleccionar solo{" "}
            <strong className="font-medium text-negro">10 vestidos</strong> para crear junto a
            Victoria Vidarte, especialmente para cada egresada.
          </p>

          <ul className="mt-5 flex flex-col gap-1.5">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="text-sm font-medium text-chocolate">
                ✨ {bullet}
              </li>
            ))}
          </ul>

          <span className="mt-5 inline-block rounded-full border border-arena px-4 py-1.5 text-xs text-taupe">
            Recibimos propuestas hasta el 30/9
          </span>

          <div className="mt-10">
            <FormularioEgreso />
          </div>
        </section>
      </main>
    </div>
  );
}
