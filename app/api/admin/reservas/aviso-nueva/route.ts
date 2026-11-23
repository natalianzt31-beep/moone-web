import { NextResponse } from "next/server";
import { getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { enviarAvisoReservaAdmin } from "@/lib/email/reservas";

/**
 * Aviso interno (mail con foto a contacto@moone.com.uy) cuando el staff carga
 * una reserva desde /admin/reservas. Lo dispara el propio formulario después
 * de guardar la reserva. Para apagarlo, poner AVISO_ACTIVO en false.
 */
const AVISO_ACTIVO = true;

export async function POST(req: Request) {
  if (!AVISO_ACTIVO) {
    return NextResponse.json({ ok: true, enviado: false });
  }

  const accessToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  const userSupabase = getSupabaseUserClient(accessToken);
  const { data: esStaff } = await userSupabase.rpc("is_staff");
  if (!esStaff) {
    return NextResponse.json({ error: "No autorizada." }, { status: 403 });
  }

  let body: { reservaId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  if (!body.reservaId) {
    return NextResponse.json({ error: "Falta reservaId." }, { status: 400 });
  }

  const resultado = await enviarAvisoReservaAdmin(body.reservaId);
  if (!resultado.ok) {
    return NextResponse.json({ ok: false, reason: resultado.reason }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enviado: true });
}
