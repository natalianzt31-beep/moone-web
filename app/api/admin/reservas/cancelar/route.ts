import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { enviarMailCancelacionReserva } from "@/lib/email/reservas";

/**
 * Cancela todas las reservas de un pedido (estado -> cancelado) y le avisa
 * a la clienta por mail. Protegida con INTERNAL_ACTION_SECRET en vez de
 * sesión de staff, igual que enviar-confirmacion, porque se dispara desde
 * fuera del navegador.
 */
async function ejecutar(pedidoId: string | null, cc: string | null) {
  if (!pedidoId) {
    return NextResponse.json({ error: "Falta pedidoId." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const { error: updateError } = await supabase
    .from("reservations")
    .update({ estado: "cancelado" })
    .eq("pedido_id", pedidoId);

  if (updateError) {
    return NextResponse.json({ ok: false, reason: updateError.message }, { status: 500 });
  }

  const resultado = await enviarMailCancelacionReserva(pedidoId, {
    cc: cc ?? undefined,
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

  let body: { pedidoId?: string; cc?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  return ejecutar(body.pedidoId ?? null, body.cc ?? null);
}

/**
 * Variante GET con el secreto por query param, para dispararla a mano sin
 * armar un POST con headers. Mismo secreto que la variante POST.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.INTERNAL_ACTION_SECRET;

  if (!secret || url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return ejecutar(url.searchParams.get("pedidoId"), url.searchParams.get("cc"));
}
