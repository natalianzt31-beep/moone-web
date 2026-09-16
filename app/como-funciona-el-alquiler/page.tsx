import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cómo funciona el alquiler",
  description:
    "Alquilar un vestido de fiesta en Môone es simple: elegís la prenda, reservás con una seña, retirás en Punta Carretas y devolvés al día siguiente del evento. Sin vueltas, sin tintorería de tu parte.",
  alternates: { canonical: "/como-funciona-el-alquiler" },
};

const PASOS = [
  {
    titulo: "Elegí tu prenda",
    texto:
      "Recorré la colección de vestidos, monos, sandalias, carteras y tapados, y filtrá por talle, color o largo hasta encontrar la pieza justa para tu evento.",
  },
  {
    titulo: "Reservá con una seña",
    texto:
      "Apartás la prenda con una seña del 50% del precio de alquiler, pagándola online con Mercado Pago o en el local. El otro 50% se abona al retirarla.",
  },
  {
    titulo: "Retirá en Punta Carretas",
    texto:
      "Pasás por el local a probarte y retirar la prenda el día hábil anterior al evento, o el mismo día si preferís. Coordinamos el horario exacto por WhatsApp.",
  },
  {
    titulo: "Viví tu evento",
    texto: "Usá la prenda con total tranquilidad: el cuidado normal del uso ya está contemplado.",
  },
  {
    titulo: "Devolvé la prenda",
    texto:
      "La devolución es el día hábil siguiente al evento (los lunes, si el evento fue en el fin de semana). Nosotros nos encargamos de la limpieza después de cada alquiler — no hace falta que la lleves a la tintorería.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Cómo funciona el alquiler
          </h1>
          <p className="mt-4 text-base leading-7 text-chocolate">
            Alquilar un vestido de fiesta en Môone es un proceso simple, pensado
            para que llegues a tu evento con la prenda perfecta sin tener que
            comprarla. Así es el recorrido, paso a paso.
          </p>

          <ol className="mt-8 flex flex-col gap-6">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-arena text-sm text-negro">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-base font-medium text-negro sm:text-lg">{paso.titulo}</h2>
                  <p className="mt-1 text-sm leading-6 text-chocolate">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/coleccion"
              className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-center text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
            >
              Ver colección
            </Link>
            <Link
              href="/faq"
              className="flex min-h-11 items-center justify-center rounded-[3px] border border-negro px-6 text-center text-sm font-medium text-negro transition-colors hover:border-chocolate hover:text-chocolate"
            >
              Ver preguntas frecuentes
            </Link>
          </div>

          <p className="mt-8 text-sm text-taupe">
            ¿Tenés alguna duda puntual?{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-chocolate hover:underline"
            >
              Escribinos por WhatsApp al {WHATSAPP_DISPLAY}
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
