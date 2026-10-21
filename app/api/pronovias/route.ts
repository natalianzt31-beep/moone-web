import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { enviarConfirmacionLeadPronovias, enviarAvisoNuevoLeadPronovias } from "@/lib/email/pronovias";
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
  const fechaCasamientoEstimada = campo("fecha_casamiento_estimada");

  const faltantes = [!nombre && "nombre", !email && "mail", !celular && "celular"].filter(
    (v): v is string => Boolean(v)
  );

  if (faltantes.length > 0) {
    return NextResponse.json(
      { error: `Faltan completar: ${faltantes.join(", ")}.` },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ingresá un mail válido." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { error: insertError } = await supabase.from("leads_pronovias").insert({
    nombre,
    email,
    celular,
    fecha_casamiento_estimada: fechaCasamientoEstimada || null,
  });

  if (insertError) {
    console.error("[pronovias] No se pudo guardar el lead", insertError);
    return NextResponse.json(
      { error: "No pudimos guardar tus datos, probá de nuevo." },
      { status: 500 }
    );
  }

  if (resendConfigurado()) {
    const lead = {
      nombre,
      email,
      celular,
      fechaCasamientoEstimada: fechaCasamientoEstimada || null,
    };
    await enviarConfirmacionLeadPronovias(lead);
    await enviarAvisoNuevoLeadPronovias(lead);
  }

  return NextResponse.json({ ok: true });
}
