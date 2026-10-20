import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { esHorarioEventoValido } from "@/lib/citasEvento";
import { EVENTO_CECILIA_MENDEZ } from "@/lib/site-config";
import {
  enviarConfirmacionEventoCeciliaMendez,
  enviarAvisoNuevoTurnoEvento,
} from "@/lib/email/eventoCeciliaMendez";
import { resendConfigurado } from "@/lib/email/resend";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "No pudimos leer el formulario." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Honeypot: un campo oculto que solo completan los bots.
  if (typeof data["bot-field"] === "string" && data["bot-field"].trim()) {
    return NextResponse.json({ ok: true });
  }

  const campo = (nombreCampo: string) => {
    const valor = data[nombreCampo];
    return typeof valor === "string" ? valor.trim() : "";
  };

  const nombre = campo("nombre");
  const email = campo("email");
  const celular = campo("celular");
  const hora = campo("hora");

  const faltantes = [
    !nombre && "nombre",
    !email && "mail",
    !celular && "celular",
    !hora && "horario",
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

  if (!esHorarioEventoValido(hora)) {
    return NextResponse.json(
      { error: "Ese horario no es válido, elegí otro de la agenda." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  const { data: insertado, error: insertError } = await supabase
    .from("citas_cecilia_mendez")
    .insert({
      fecha: EVENTO_CECILIA_MENDEZ.fecha,
      hora,
      nombre,
      email,
      celular,
    })
    .select("token")
    .single();

  if (insertError) {
    console.error("[evento-cecilia-mendez] No se pudo guardar el turno", insertError);
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
    const turno = { nombre, email, celular, hora, token: insertado.token as string };
    await enviarConfirmacionEventoCeciliaMendez(turno);
    await enviarAvisoNuevoTurnoEvento(turno);
  }

  return NextResponse.json({ ok: true });
}
