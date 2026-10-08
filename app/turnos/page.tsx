import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AgendaTurnoForm } from "@/app/turnos/AgendaTurnoForm";
import { turnosEnabled } from "@/lib/features";

export const metadata: Metadata = {
  title: "Turno con la modista",
  description:
    "Agendá un turno con nuestra modista: viernes de 14 a 18 y sábados de 10 a 18. Contanos la fecha de tu fiesta y mostranos el vestido que querés lograr.",
  alternates: { canonical: "/turnos" },
};

export default function TurnosPage() {
  if (!turnosEnabled) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-taupe">
            Môone
          </p>
          <h1 className="mt-2 text-2xl font-normal tracking-tight text-negro sm:text-3xl">
            Turno con la <em className="font-normal not-italic text-chocolate">modista</em>
          </h1>
          <p className="mt-4 text-base leading-7 text-chocolate">
            Agendá un horario para venir a probarte y ajustar tu vestido con nuestra modista.
            Atendemos los <strong className="font-medium text-negro">viernes de 14 a 18</strong> y
            los <strong className="font-medium text-negro">sábados de 10 a 18</strong>, en turnos
            de media hora.
          </p>

          <div className="mt-10">
            <AgendaTurnoForm />
          </div>
        </section>
      </main>
    </div>
  );
}
