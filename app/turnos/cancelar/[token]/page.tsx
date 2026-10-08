"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

type TurnoInfo = { fecha: string; hora: string; estado: "confirmada" | "cancelada"; nombre: string };

function formatFechaLarga(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
}

export default function CancelarTurnoPage() {
  const params = useParams<{ token: string }>();

  const [turno, setTurno] = useState<TurnoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [cancelado, setCancelado] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/citas/cancelar?token=${encodeURIComponent(params.token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "No encontramos ese turno.");
        if (!cancelled) setTurno(data.turno);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    cargar();

    return () => {
      cancelled = true;
    };
  }, [params.token]);

  async function handleCancelar() {
    setCancelando(true);
    setError(null);
    try {
      const res = await fetch("/api/citas/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No pudimos cancelar el turno.");
      setCancelado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-4 py-10 sm:px-8 sm:py-16">
          <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
            Cancelar turno
          </h1>

          {loading && <p className="mt-6 text-sm text-taupe">Buscando tu turno...</p>}

          {!loading && error && (
            <div className="mt-6 flex flex-col gap-3 rounded-[3px] border border-arena bg-blanco p-6">
              <p className="text-sm text-chocolate">{error}</p>
              <p className="text-sm text-chocolate">
                Si necesitás ayuda, escribinos por{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  WhatsApp al {WHATSAPP_DISPLAY}
                </a>
                .
              </p>
            </div>
          )}

          {!loading && !error && turno && cancelado && (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-[3px] border border-arena bg-blanco px-6 py-10 text-center">
              <span className="text-3xl">🤍</span>
              <h2 className="text-lg font-normal text-negro">Listo, cancelamos tu turno</h2>
              <p className="text-sm leading-6 text-chocolate">
                Te esperamos otro día — podés agendar un nuevo turno cuando quieras.
              </p>
              <Link
                href="/turnos"
                className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
              >
                Agendar otro turno
              </Link>
            </div>
          )}

          {!loading && !error && turno && !cancelado && turno.estado === "cancelada" && (
            <div className="mt-6 rounded-[3px] border border-arena bg-blanco p-6">
              <p className="text-sm text-chocolate">Este turno ya estaba cancelado.</p>
              <Link
                href="/turnos"
                className="mt-4 flex min-h-11 w-fit items-center justify-center rounded-full bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate"
              >
                Agendar un turno
              </Link>
            </div>
          )}

          {!loading && !error && turno && !cancelado && turno.estado === "confirmada" && (
            <div className="mt-6 flex flex-col gap-4 rounded-[3px] border border-arena bg-blanco p-6">
              <p className="text-sm text-chocolate">
                Hola {turno.nombre}, ¿confirmás que querés cancelar tu turno del{" "}
                <strong className="font-medium text-negro">{formatFechaLarga(turno.fecha)}</strong> a
                las <strong className="font-medium text-negro">{turno.hora}</strong>?
              </p>
              <button
                type="button"
                onClick={handleCancelar}
                disabled={cancelando}
                className="flex min-h-11 items-center justify-center rounded-full bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
              >
                {cancelando ? "Cancelando…" : "Sí, cancelar mi turno"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
