"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-config";

const TALLES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "No estoy segura"];

/** Límite de la imagen: Vercel corta las funciones serverless en ~4.5MB por request. */
const MAX_IMAGEN_BYTES = 4 * 1024 * 1024;

const inputClass =
  "rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";
const labelClass = "flex flex-col gap-1 text-sm text-negro";
const errorClass = "text-xs text-chocolate";

type Estado = "idle" | "enviando" | "enviado" | "error";

export function FormularioEgreso() {
  const [nombre, setNombre] = useState("");
  const [liceo, setLiceo] = useState("");
  const [graduacion, setGraduacion] = useState("");
  const [talle, setTalle] = useState("");
  const [color, setColor] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [gusta, setGusta] = useState("");
  const [cambiaria, setCambiaria] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [botField, setBotField] = useState("");

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

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
    if (!nombre.trim()) nuevosErrores.nombre = "Contanos tu nombre.";
    if (!liceo.trim()) nuevosErrores.liceo = "Este campo es obligatorio.";
    if (!graduacion) nuevosErrores.graduacion = "Elegí una fecha.";
    if (!talle) nuevosErrores.talle = "Elegí un talle.";
    if (!color.trim()) nuevosErrores.color = "Contanos el color.";
    if (!imagen) nuevosErrores.imagen = "Subí una imagen de referencia.";
    if (!instagram.trim()) nuevosErrores.instagram = "Dejanos tu Instagram.";
    if (!whatsapp.trim()) nuevosErrores.whatsapp = "Dejanos tu WhatsApp.";
    if (!acepto) nuevosErrores.acepto = "Necesitamos que aceptes esto para continuar.";

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
      formData.set("nombre", nombre);
      formData.set("liceo", liceo);
      formData.set("graduacion", graduacion);
      formData.set("talle", talle);
      formData.set("color", color);
      formData.set("gusta", gusta);
      formData.set("cambiaria", cambiaria);
      formData.set("instagram", instagram);
      formData.set("whatsapp", whatsapp);
      formData.set("bot-field", botField);
      if (imagen) formData.set("imagen", imagen);

      const res = await fetch("/api/egresadas", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No pudimos enviar tu inspiración.");
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
        <h2 className="text-xl font-normal text-negro">¡Recibimos tu vestido!</h2>
        <p className="text-sm leading-6 text-chocolate">
          Gracias por compartir con nosotras cómo imaginás uno de los días más especiales de tu
          vida.
        </p>
        <p className="text-sm leading-6 text-chocolate">
          Vamos a mirar cada propuesta y seleccionar 10 vestidos para crear esta temporada.
        </p>
        <p className="text-sm leading-6 text-chocolate">
          Si el tuyo es uno de ellos, nos vamos a contactar con vos. ✨
        </p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-taupe">
          Victoria Vidarte × Môone
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
        ¿De qué liceo/colegio sos? <span className="text-chocolate">*</span>
        <input
          type="text"
          value={liceo}
          onChange={(e) => setLiceo(e.target.value)}
          placeholder="Ej: Liceo N.º 5"
          className={inputClass}
        />
        {errores.liceo && <span className={errorClass}>{errores.liceo}</span>}
      </label>

      <label className={labelClass}>
        ¿Cuándo es tu graduación? <span className="text-chocolate">*</span>
        <input
          type="date"
          value={graduacion}
          onChange={(e) => setGraduacion(e.target.value)}
          className={inputClass}
        />
        {errores.graduacion && <span className={errorClass}>{errores.graduacion}</span>}
      </label>

      <label className={labelClass}>
        ¿Qué talle usás aproximadamente? <span className="text-chocolate">*</span>
        <select
          value={talle}
          onChange={(e) => setTalle(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Elegí una opción
          </option>
          {TALLES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errores.talle && <span className={errorClass}>{errores.talle}</span>}
      </label>

      <label className={labelClass}>
        ¿En qué color imaginás tu vestido? 🎨 <span className="text-chocolate">*</span>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="Ej: verde esmeralda, blanco roto…"
          className={inputClass}
        />
        {errores.color && <span className={errorClass}>{errores.color}</span>}
      </label>

      <div className="flex flex-col gap-1 text-sm text-negro">
        Mostranos el vestido que imaginás 🤍 <span className="text-chocolate">*</span>
        <label className="mt-1 flex cursor-pointer flex-col items-center gap-1 rounded-[3px] border border-dashed border-taupe bg-blanco px-4 py-6 text-center">
          <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
          <span className="text-sm font-medium text-chocolate">
            {imagen ? "Imagen cargada — tocá para cambiarla" : "Tocá para subir una imagen"}
          </span>
          <span className="text-xs text-taupe">
            Foto, captura, boceto o cualquier referencia que ayude a entender tu idea
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
        ¿Qué es lo que más te gusta de ese vestido?
        <textarea
          value={gusta}
          onChange={(e) => setGusta(e.target.value)}
          placeholder="El escote, la espalda, la caída, la falda… contanos qué te enamoró."
          className={`${inputClass} min-h-20 resize-y`}
        />
      </label>

      <label className={labelClass}>
        ¿Cambiarías algo del modelo de la foto?
        <textarea
          value={cambiaria}
          onChange={(e) => setCambiaria(e.target.value)}
          className={`${inputClass} min-h-20 resize-y`}
        />
      </label>

      <label className={labelClass}>
        Tu Instagram <span className="text-chocolate">*</span>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@usuario"
          className={inputClass}
        />
        {errores.instagram && <span className={errorClass}>{errores.instagram}</span>}
      </label>

      <label className={labelClass}>
        Tu WhatsApp <span className="text-chocolate">*</span>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej: 099 123 456"
          className={inputClass}
        />
        {errores.whatsapp && <span className={errorClass}>{errores.whatsapp}</span>}
      </label>

      <div className="flex flex-col gap-1 border-t border-arena pt-4">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="acepto"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-negro"
          />
          <label htmlFor="acepto" className="text-xs leading-5 text-chocolate">
            Entiendo que la imagen que envío funciona como inspiración. Victoria Vidarte
            desarrollará una propuesta a partir de ella y, si mi vestido es seleccionado, recibiré
            el diseño, presupuesto y opciones de tela antes de confirmar la compra.
          </label>
        </div>
        {errores.acepto && <span className={errorClass}>{errores.acepto}</span>}
      </div>

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
        {estado === "enviando" ? "Enviando…" : "Enviar mi inspiración"}
      </button>
    </form>
  );
}
