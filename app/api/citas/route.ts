import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { esHorarioValido } from "@/lib/citas";
import { enviarConfirmacionTurno, enviarAvisoNuevoTurno } from "@/lib/email/citas";
import { resendConfigurado } from "@/lib/email/resend";

/** Vercel corta las funciones serverless en ~4.5MB por request; dejamos margen. */
const MAX_IMAGEN_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "No pudimos leer el formulario." }, { status: 400 });
  }

  // Honeypot: un campo oculto que solo completan los bots. Si viene lleno,
  // fingimos éxito para no delatar el mecanismo, pero no agendamos nada.
  const botField = formData.get("bot-field");
  if (typeof botField === "string" && botField.trim()) {
    return NextResponse.json({ ok: true });
  }

  const campo = (nombreCampo: string) => {
    const valor = formData.get(nombreCampo);
    return typeof valor === "string" ? valor.trim() : "";
  };

  const nombre = campo("nombre");
  const email = campo("email");
  const celular = campo("celular");
  const fecha = campo("fecha");
  const hora = campo("hora");
  const fechaFiesta = campo("fecha_fiesta");
  const imagen = formData.get("imagen");

  const faltantes = [
    !nombre && "nombre",
    !email && "mail",
    !celular && "celular",
    !fecha && "fecha",
    !hora && "horario",
    !fechaFiesta && "fecha de la fiesta",
  ].filter((v): v is string => Boolean(v));

  if (faltantes.length > 0) {
    return NextResponse.json(
      { error: `Faltan completar: ${faltantes.join(", ")}.` },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ingresá un mail válido." }, { status: 400 });
  }

  if (!esHorarioValido(fecha, hora)) {
    return NextResponse.json(
      { error: "Ese horario no es válido, elegí otro de la agenda." },
      { status: 400 }
    );
  }

  if (!(imagen instanceof File) || imagen.size === 0) {
    return NextResponse.json(
      { error: "Subí una foto del vestido que querés lograr." },
      { status: 400 }
    );
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

  const supabase = getSupabaseServiceClient();

  // Un feriado cargado después de que la clienta abrió el formulario podría
  // colar un horario de un día que ya no atiende — lo re-chequeamos acá.
  const { data: cerrado } = await supabase
    .from("closed_dates")
    .select("fecha")
    .eq("fecha", fecha)
    .maybeSingle();
  if (cerrado) {
    return NextResponse.json({ error: "Ese día no atendemos, elegí otra fecha." }, { status: 400 });
  }

  const buffer = Buffer.from(await imagen.arrayBuffer());
  const extension = imagen.name.includes(".") ? imagen.name.split(".").pop() : "jpg";
  const nombreArchivo = `turno-${
    nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "clienta"
  }.${extension}`;

  // Guardar en la base es lo que importa de verdad (así la modista ve el
  // turno en el backoffice pase lo que pase con el mail) — se hace primero
  // y si falla, se corta acá. Los mails de abajo son best-effort.
  const imagenPath = `${crypto.randomUUID()}-${nombreArchivo}`;

  const { error: uploadError } = await supabase.storage
    .from("citas-modista")
    .upload(imagenPath, buffer, { contentType: imagen.type });

  if (uploadError) {
    console.error("[citas] No se pudo subir la imagen", uploadError);
    return NextResponse.json(
      { error: "No pudimos guardar tu imagen, probá de nuevo." },
      { status: 500 }
    );
  }

  const { data: insertado, error: insertError } = await supabase
    .from("citas_modista")
    .insert({
      fecha,
      hora,
      nombre,
      email,
      celular,
      fecha_fiesta: fechaFiesta,
      imagen_path: imagenPath,
    })
    .select("token")
    .single();

  if (insertError) {
    console.error("[citas] No se pudo guardar el turno", insertError);
    // 23505 = unique_violation: alguien reservó ese mismo horario mientras
    // esta clienta completaba el formulario.
    const yaReservado = insertError.code === "23505";
    return NextResponse.json(
      {
        error: yaReservado
          ? "Justo se reservó ese horario, elegí otro."
          : "No pudimos guardar tu turno, probá de nuevo.",
      },
      { status: yaReservado ? 409 : 500 }
    );
  }

  if (resendConfigurado()) {
    const turno = {
      nombre,
      email,
      celular,
      fecha,
      hora,
      fecha_fiesta: fechaFiesta,
      token: insertado.token as string,
    };
    await enviarConfirmacionTurno(turno);
    await enviarAvisoNuevoTurno(turno, {
      nombreArchivo,
      base64: buffer.toString("base64"),
    });
  }

  return NextResponse.json({ ok: true });
}
