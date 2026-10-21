"use client";

import { useState, type FormEvent } from "react";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

const inputClass =
  "rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";
const labelClass = "flex flex-col gap-1 text-sm text-negro";
const errorClass = "text-xs text-chocolate";

type Estado = "idle" | "enviando" | "enviado" | "error";

export function PronoviasForm() {
  const [nombre, setNombre] = useState("");
  const [fechaCasamiento, setFechaCasamiento] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [botField, setBotField] = useState("");

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function validar(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!nombre.trim()) nuevosErrores.nombre = "Contanos tu nombre.";
    if (!celular.trim()) nuevosErrores.celular = "Dejanos tu celular.";
    if (!email.trim()) nuevosErrores.email = "Dejanos tu mail.";

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
      const res = await fetch("/api/pronovias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          fecha_casamiento_estimada: fechaCasamiento,
          celular,
          email,
          "bot-field": botField,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No pudimos enviar tus datos.");
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
        <h2 className="text-xl font-normal text-negro">¡Listo, recibimos tus datos!</h2>
        <p className="text-sm leading-6 text-chocolate">
          Te vamos a escribir por WhatsApp para coordinar el día y el horario de tu prueba. Los
          cupos son limitados.
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
        ¿Cuándo es (o sería) tu casamiento?{" "}
        <span className="text-xs font-normal text-taupe">(opcional, fecha estimada)</span>
        <input
          type="date"
          value={fechaCasamiento}
          onChange={(e) => setFechaCasamiento(e.target.value)}
          className={inputClass}
        />
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
        {estado === "enviando" ? "Enviando…" : "Quiero probarme un vestido"}
      </button>
    </form>
  );
}
