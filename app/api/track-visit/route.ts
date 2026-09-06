import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

/**
 * Registra una visita para el panel de analítica del backoffice. Anónimo
 * a propósito (no pide sesión): cualquiera que navegue el sitio dispara
 * esto una vez por pestaña, así que se inserta con la service role (la
 * tabla no tiene política de insert pública).
 */
export async function POST(req: Request) {
  let body: { sessionId?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { sessionId, path } = body;
  if (!sessionId || !path) {
    return NextResponse.json({ error: "Faltan sessionId o path." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("page_views")
    .insert({ session_id: sessionId.slice(0, 100), path: path.slice(0, 300) });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
