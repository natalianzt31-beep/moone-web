import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

const EVENTOS = new Set(["mostrada", "click", "agregada"]);
const ORIGENES = new Set(["ficha", "post_agregar", "carrito"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidONull(valor: unknown): string | null {
  return typeof valor === "string" && UUID.test(valor) ? valor : null;
}

/**
 * Registra un evento del módulo "Completá tu look" (recomendaciones
 * mostradas, clics y artículos agregados). Anónimo como /api/track-visit;
 * el client_id solo se guarda si viene de una sesión válida.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
  const evento = String(body.evento ?? "");
  const origen = String(body.origen ?? "");
  if (!sessionId || !EVENTOS.has(evento) || !ORIGENES.has(origen)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  // El client_id lo tomamos del token de sesión (no del body), para que
  // nadie pueda atribuirle eventos a otra clienta.
  let clientId: string | null = null;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (token) {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      const { data: cliente } = await supabase
        .from("clients")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();
      clientId = cliente?.id ?? null;
    }
  }

  const cantidad = Number.isInteger(body.cantidad) ? Math.min(Math.max(Number(body.cantidad), 1), 50) : 1;

  const { error } = await supabase.from("recomendacion_eventos").insert({
    session_id: sessionId,
    client_id: clientId,
    evento,
    origen,
    producto_base_id: uuidONull(body.productoBaseId),
    producto_id: uuidONull(body.productoId),
    cantidad,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
