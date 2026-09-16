import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { enviarMailCuentaExistente } from "@/lib/email/cuenta";

/**
 * Se llama antes de intentar registrar una cuenta nueva. Supabase, si el
 * mail ya está confirmado, no manda ningún aviso (por seguridad, para no
 * dejar "adivinar" qué mails están registrados) — así que este endpoint es
 * el que se encarga de avisarle a esa persona qué pasó.
 */
export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Falta el email." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: existe, error } = await supabase.rpc("email_ya_registrado", {
    p_email: email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existe) {
    await enviarMailCuentaExistente(email);
  }

  return NextResponse.json({ existe: Boolean(existe) });
}
