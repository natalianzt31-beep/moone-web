"use client";

import { useEffect, useState, type FormEvent } from "react";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

const inputClass =
  "rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";
const labelClass = "flex flex-col gap-1 text-sm text-negro";
const errorClass = "text-xs text-chocolate";

type Estado = "idle" | "enviando" | "enviado" | "error";

export function AgendaEventoForm() {
  const [horarios, setHorarios] = useState<string[]>([]);
  const [cargandoAgenda, setCargandoAgenda] = useState(true);
  const [errorAgenda, setErrorAgenda] = useState<string | null>(null);

  const [hora, setHora] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [botField, setBotField] = useState("");

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function cargarAgenda() {
    setCargandoAgenda(true);
    setErrorAgenda(null);
    try {
      const res = await fetch("/api/evento-cecilia-mendez/disponibilidad");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHorarios(data.horarios ?? []);
    } catch {
      setErrorAgenda("No pudimos cargar los horarios disponibles. Recargá la página.");
    } finally {
      setCargandoAgenda(false);
    }
  }

  useEffect(() => {
    cargarAgenda();
  }, []);

  function validar(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!hora) nuevosErrores.horario = "Elegí un horario.";
    if (!nombre.trim()) nuevosErrores.nombre = "Contanos tu nombre.";
    if (!email.trim()) nuevosErrores.email = "Dejanos tu mail.";
    if (!celular.trim()) nuevosErrores.celular = "Dejanos tu celular.";

    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((msg) => !msg);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);

    if (botField) return; // honeypot: los bots completan este campo oculto

    if (!validar()) return;

    setEstado("enviando");
    try {
      const res = await fetch("/api/evento-cecilia-mendez", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hora, nombre, email, celular, "bot-field": botField }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No pudimos agendar tu turno.");
      }

      setEstado("enviado");
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : "Error desconocido");
      setEstado("error");
    }
  }

  if (estado === "enviado") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[3px] border border-arena bg-blanco px-6 py-12 text-center">
        <span className="text-3xl">🤍</span>
        <h2 className="text-xl font-normal text-negro">¡Turno confirmado!</h2>
        <p className="text-sm leading-6 text-chocolate">
          Te esperamos el <strong className="font-medium text-negro">viernes 13 de noviembre</strong>{" "}
          a las <strong className="font-medium text-negro">{hora}</strong>.
        </p>
        <p className="text-sm leading-6 text-chocolate">
          Te mandamos un mail a {email} con los detalles y el link para cancelar si al final no
          podés venir.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <p className="hidden">
        <label>
          No completar:
          <input
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-negro">
          Elegí un horario <span className="text-chocolate">*</span>
        </p>

        {cargandoAgenda && <p className="text-sm text-taupe">Cargando horarios...</p>}
        {!cargandoAgenda && errorAgenda && <p className={errorClass}>{errorAgenda}</p>}
        {!cargandoAgenda && !errorAgenda && horarios.length === 0 && (
          <p className="text-sm text-taupe">Ya no quedan cupos disponibles para este evento.</p>
        )}

        {!cargandoAgenda && horarios.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {horarios.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHora(h)}
                className={`flex min-h-11 items-center justify-center rounded-[3px] border text-sm transition-colors ${
                  hora === h
                    ? "border-negro bg-negro text-blanco"
                    : "border-arena bg-blanco text-negro hover:border-chocolate"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        )}

        {errores.horario && <span className={errorClass}>{errores.horario}</span>}
      </div>

      <label className={labelClass}>
        Nombre y apellido <span className="text-chocolate">*</span>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Sofía Rodríguez"
          className={inputClass}
        />
        {errores.nombre && <span className={errorClass}>{errores.nombre}</span>}
      </label>

      <label className={labelClass}>
        Tu mail <span className="text-chocolate">*</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@mail.com"
          className={inputClass}
        />
        {errores.email && <span className={errorClass}>{errores.email}</span>}
      </label>

      <label className={labelClass}>
        Tu celular <span className="text-chocolate">*</span>
        <input
          type="text"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          placeholder="Ej: 099 123 456"
          className={inputClass}
        />
        {errores.celular && <span className={errorClass}>{errores.celular}</span>}
      </label>

      {errorGeneral && (
        <p className="text-sm text-chocolate">
          {errorGeneral} Si el problema sigue, escribinos por{" "}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline">
            WhatsApp al {WHATSAPP_DISPLAY}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
      >
        {estado === "enviando" ? "Agendando…" : "Confirmar turno"}
      </button>
    </form>
  );
}
