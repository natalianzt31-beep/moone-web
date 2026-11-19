import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { enviarConfirmacionTurno } from "@/lib/email/citas";

/**
 * Dispara a mano el mail "¡Tu turno con la modista está confirmado!" para un
 * turno ya cargado (por ejemplo, uno reprogramado a mano desde la base
 * porque alguien agendó un horario que había que bloquear). Protegida con
 * INTERNAL_ACTION_SECRET en vez de sesión de staff, igual que el equivalente
 * de reservas, porque se dispara desde fuera del navegador.
 */
async function ejecutar(citaId: string | null) {
  if (!citaId) {
    return NextResponse.json({ error: "Falta citaId." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: turno, error } = await supabase
    .from("citas_modista")
    .select("nombre, email, celular, fecha, hora, fecha_fiesta, token, imagen_path")
    .eq("id", citaId)
    .maybeSingle();

  if (error || !turno) {
    return NextResponse.json({ error: "No se encontró ese turno." }, { status: 404 });
  }

  const resultado = await enviarConfirmacionTurno({
    nombre: turno.nombre,
    email: turno.email,
    celular: turno.celular,
    fecha: turno.fecha,
    hora: turno.hora,
    fecha_fiesta: turno.fecha_fiesta,
    token: turno.token,
    tieneImagen: Boolean(turno.imagen_path),
  });

  if (!resultado.ok) {
    return NextResponse.json({ ok: false, reason: resultado.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.INTERNAL_ACTION_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: { citaId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  return ejecutar(body.citaId ?? null);
}

/**
 * Variante GET con el secreto por query param, para dispararla desde
 * herramientas que no arman un POST con headers. Mismo secreto que la
 * variante POST.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.INTERNAL_ACTION_SECRET;

  if (!secret || url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return ejecutar(url.searchParams.get("citaId"));
}
