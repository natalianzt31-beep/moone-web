import { NextResponse } from "next/server";
import { enviarEmail, resendConfigurado } from "@/lib/email/resend";
import { BUSINESS } from "@/lib/site";

/** Vercel corta las funciones serverless en ~4.5MB por request; dejamos margen. */
const MAX_IMAGEN_BYTES = 4 * 1024 * 1024;

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFechaGraduacion(iso: string): string {
  const fecha = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return escapeHtml(iso);
  return fecha.toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" });
}

function filaHtml(etiqueta: string, valor: string): string {
  if (!valor) return "";
  return `
    <tr>
      <td style="padding: 8px 0; color:#A49587; font-size: 13px; vertical-align: top; white-space:nowrap;">${etiqueta}</td>
      <td style="padding: 8px 0 8px 16px; color:#171513; font-size: 14px;">${escapeHtml(valor)}</td>
    </tr>`;
}

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "No pudimos leer el formulario." }, { status: 400 });
  }

  // Honeypot: un campo oculto que solo completan los bots. Si viene lleno,
  // fingimos éxito para no delatar el mecanismo, pero no mandamos nada.
  const botField = formData.get("bot-field");
  if (typeof botField === "string" && botField.trim()) {
    return NextResponse.json({ ok: true });
  }

  const campo = (nombreCampo: string) => {
    const valor = formData.get(nombreCampo);
    return typeof valor === "string" ? valor.trim() : "";
  };

  const nombre = campo("nombre");
  const liceo = campo("liceo");
  const graduacion = campo("graduacion");
  const talle = campo("talle");
  const color = campo("color");
  const gusta = campo("gusta");
  const cambiaria = campo("cambiaria");
  const instagram = campo("instagram");
  const whatsapp = campo("whatsapp");
  const imagen = formData.get("imagen");

  const faltantes = [
    !nombre && "nombre",
    !liceo && "liceo",
    !graduacion && "fecha de graduación",
    !talle && "talle",
    !color && "color",
    !instagram && "Instagram",
    !whatsapp && "WhatsApp",
  ].filter((v): v is string => Boolean(v));

  if (faltantes.length > 0) {
    return NextResponse.json(
      { error: `Faltan completar: ${faltantes.join(", ")}.` },
      { status: 400 }
    );
  }

  if (!(imagen instanceof File) || imagen.size === 0) {
    return NextResponse.json({ error: "Subí una imagen de referencia." }, { status: 400 });
  }
  if (!imagen.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo tiene que ser una imagen." }, { status: 400 });
  }
  if (imagen.size > MAX_IMAGEN_BYTES) {
    return NextResponse.json(
      { error: "La imagen pesa más de 4MB, probá con otra." },
      { status: 400 }
    );
  }

  if (!resendConfigurado()) {
    return NextResponse.json(
      { error: "El envío de mails no está configurado todavía." },
      { status: 503 }
    );
  }

  const buffer = Buffer.from(await imagen.arrayBuffer());
  const base64 = buffer.toString("base64");
  const extension = imagen.name.includes(".") ? imagen.name.split(".").pop() : "jpg";
  const nombreArchivo = `inspiracion-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "egresada"}.${extension}`;

  const filas = [
    filaHtml("Nombre", nombre),
    filaHtml("Liceo/colegio", liceo),
    filaHtml("Graduación", formatFechaGraduacion(graduacion)),
    filaHtml("Talle", talle),
    filaHtml("Color imaginado", color),
    filaHtml("Instagram", instagram),
    filaHtml("WhatsApp", whatsapp),
    filaHtml("Qué le gusta del modelo", gusta),
    filaHtml("Qué cambiaría", cambiaria),
  ].join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px;">
      <h1 style="font-family: Georgia, serif; color:#171513; font-size: 20px; font-weight: 500; margin: 0 0 4px;">
        Nueva inspiración — Egresadas × Victoria Vidarte
      </h1>
      <p style="color:#A49587; font-size: 13px; margin: 0 0 20px;">La imagen de referencia va adjunta a este mail.</p>
      <table width="100%" cellpadding="0" cellspacing="0">${filas}</table>
    </div>
  `.trim();

  const resultado = await enviarEmail({
    to: BUSINESS.email,
    subject: `Egresadas — nueva inspiración de ${nombre}`,
    html,
    attachments: [{ filename: nombreArchivo, content: base64 }],
  });

  if (!resultado.ok) {
    return NextResponse.json(
      { error: "No pudimos enviar tu inspiración, probá de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
