"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

type SlotDia = { fecha: string; etiqueta: string; horarios: string[] };

/** Límite de la imagen: Vercel corta las funciones serverless en ~4.5MB por request. */
const MAX_IMAGEN_BYTES = 4 * 1024 * 1024;

const inputClass =
  "rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";
const labelClass = "flex flex-col gap-1 text-sm text-negro";
const errorClass = "text-xs text-chocolate";

type Estado = "idle" | "enviando" | "enviado" | "error";

function formatFechaCorta(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("es-UY", { day: "numeric", month: "short" })
    .replace(".", "");
}

function formatFechaLarga(iso: string): string {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "");
}

export function AgendaTurnoForm() {
  const [agenda, setAgenda] = useState<SlotDia[]>([]);
  const [cargandoAgenda, setCargandoAgenda] = useState(true);
  const [errorAgenda, setErrorAgenda] = useState<string | null>(null);

  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [fechaFiesta, setFechaFiesta] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [botField, setBotField] = useState("");

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function cargarAgenda() {
    setCargandoAgenda(true);
    setErrorAgenda(null);
    try {
      const res = await fetch("/api/citas/disponibilidad");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAgenda(data.agenda ?? []);
    } catch {
      setErrorAgenda("No pudimos cargar los horarios disponibles. Recargá la página.");
    } finally {
      setCargandoAgenda(false);
    }
  }

  useEffect(() => {
    cargarAgenda();
  }, []);

  const diaSeleccionado = useMemo(
    () => agenda.find((d) => d.fecha === fecha) ?? null,
    [agenda, fecha]
  );

  function handleSeleccionarFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora(null);
  }

  function handleImagenChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setImagen(null);
      setImagenPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrores((prev) => ({ ...prev, imagen: "Ese archivo no es una imagen." }));
      return;
    }
    if (file.size > MAX_IMAGEN_BYTES) {
      setErrores((prev) => ({ ...prev, imagen: "La imagen pesa más de 4MB, probá con otra." }));
      return;
    }
    setErrores((prev) => ({ ...prev, imagen: "" }));
    setImagen(file);
    setImagenPreview(URL.createObjectURL(file));
  }

  function validar(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!fecha || !hora) nuevosErrores.horario = "Elegí un día y un horario.";
    if (!nombre.trim()) nuevosErrores.nombre = "Contanos tu nombre.";
    if (!email.trim()) nuevosErrores.email = "Dejanos tu mail.";
    if (!celular.trim()) nuevosErrores.celular = "Dejanos tu celular.";
    if (!fechaFiesta) nuevosErrores.fechaFiesta = "Elegí la fecha de tu fiesta.";
    if (!imagen) nuevosErrores.imagen = "Subí una foto del vestido que querés lograr.";

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
      const formData = new FormData();
      formData.set("fecha", fecha!);
      formData.set("hora", hora!);
      formData.set("nombre", nombre);
      formData.set("email", email);
      formData.set("celular", celular);
      formData.set("fecha_fiesta", fechaFiesta);
      formData.set("bot-field", botField);
      if (imagen) formData.set("imagen", imagen);

      const res = await fetch("/api/citas", { method: "POST", body: formData });
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
          Te esperamos el <strong className="font-medium text-negro">{formatFechaLarga(fecha!)}</strong>{" "}
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
          Elegí un día <span className="text-chocolate">*</span>
        </p>

        {cargandoAgenda && <p className="text-sm text-taupe">Cargando horarios...</p>}
        {!cargandoAgenda && errorAgenda && <p className={errorClass}>{errorAgenda}</p>}
        {!cargandoAgenda && !errorAgenda && agenda.length === 0 && (
          <p className="text-sm text-taupe">No hay turnos disponibles por ahora.</p>
        )}

        {!cargandoAgenda && agenda.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {agenda.map((dia) => (
              <button
                key={dia.fecha}
                type="button"
                onClick={() => handleSeleccionarFecha(dia.fecha)}
                className={`flex min-h-11 shrink-0 flex-col items-center justify-center rounded-[3px] border px-4 py-1.5 text-center transition-colors ${
                  fecha === dia.fecha
                    ? "border-negro bg-negro text-blanco"
                    : "border-taupe bg-blanco text-negro hover:border-chocolate"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  {dia.etiqueta}
                </span>
                <span className="text-sm font-medium">{formatFechaCorta(dia.fecha)}</span>
              </button>
            ))}
          </div>
        )}

        {diaSeleccionado && (
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {diaSeleccionado.horarios.map((h) => (
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
        ¿Cuándo es tu fiesta? <span className="text-chocolate">*</span>
        <input
          type="date"
          value={fechaFiesta}
          onChange={(e) => setFechaFiesta(e.target.value)}
          className={inputClass}
        />
        {errores.fechaFiesta && <span className={errorClass}>{errores.fechaFiesta}</span>}
      </label>

      <div className="flex flex-col gap-1 text-sm text-negro">
        Mostranos el vestido que querés lograr 🤍 <span className="text-chocolate">*</span>
        <label className="mt-1 flex cursor-pointer flex-col items-center gap-1 rounded-[3px] border border-dashed border-taupe bg-blanco px-4 py-6 text-center">
          <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
          <span className="text-sm font-medium text-chocolate">
            {imagen ? "Imagen cargada — tocá para cambiarla" : "Tocá para subir una imagen"}
          </span>
          <span className="text-xs text-taupe">
            Foto, captura, boceto o cualquier referencia que ayude a entender la idea
          </span>
          {imagenPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagenPreview}
              alt="Vista previa de la imagen de referencia"
              className="mt-2 max-h-64 rounded-[3px] object-contain"
            />
          )}
        </label>
        {errores.imagen && <span className={errorClass}>{errores.imagen}</span>}
      </div>

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
