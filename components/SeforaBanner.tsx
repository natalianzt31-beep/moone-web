import Link from "next/link";
import { Dancing_Script } from "next/font/google";

const script = Dancing_Script({ subsets: ["latin"], weight: ["700"] });

/** Banner del home que lleva a /sefora-lenceria (lencería y trajes de baño). */
export function SeforaBanner() {
  return (
    <section className="border-y border-arena bg-blanco">
      <Link
        href="/sefora-lenceria"
        className="group mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 text-center sm:flex-row sm:justify-between sm:gap-8 sm:px-8 sm:py-12 sm:text-left"
      >
        <div className="flex flex-col items-center sm:items-start">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-taupe">
            Nuevo en Môone
          </p>
          <div className="mt-2 flex flex-col items-center leading-none sm:items-start">
            <span
              className={`${script.className} text-5xl text-negro sm:text-6xl`}
              aria-hidden="true"
            >
              Séfora
            </span>
            <span
              className="mt-1 self-end text-sm tracking-[0.3em] text-chocolate sm:text-base"
              aria-hidden="true"
            >
              LENCERÍA
            </span>
          </div>
          <h2 className="sr-only">Séfora Lencería</h2>
        </div>

        <p className="max-w-md text-sm leading-6 text-chocolate sm:text-base sm:leading-7">
          Conjuntos, bodies y trajes de baño para completar tu look, por dentro y por fuera.
        </p>

        <span className="flex min-h-11 w-fit shrink-0 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors group-hover:bg-chocolate">
          Ver Séfora Lencería
        </span>
      </Link>
    </section>
  );
}
