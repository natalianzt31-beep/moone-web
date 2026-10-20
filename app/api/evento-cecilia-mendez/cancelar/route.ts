import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

/** Trae los datos mínimos de un turno del evento a partir de su token, para mostrar la pantalla de "¿confirmás la baja?". */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Falta el token." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("citas_cecilia_mendez")
    .select("hora, estado, nombre")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "No encontramos ese turno." }, { status: 404 });
  }

  return NextResponse.json({ turno: data });
}

/** Da de baja el turno del evento. Un GET no muta a propósito. */
export async function POST(req: Request) {
  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "No pudimos leer la solicitud." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "Falta el token." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("citas_cecilia_mendez")
    .update({ estado: "cancelada", cancelado_at: new Date().toISOString() })
    .eq("token", token)
    .eq("estado", "confirmada")
    .select("hora")
    .maybeSingle();

  if (error) {
    console.error("[evento-cecilia-mendez] No se pudo cancelar el turno", error);
    return NextResponse.json(
      { error: "No pudimos cancelar el turno, probá de nuevo." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Ese turno ya estaba cancelado o no existe." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, turno: data });
}
