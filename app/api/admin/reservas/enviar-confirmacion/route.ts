import { NextResponse } from "next/server";
import { enviarMailConfirmacionReserva } from "@/lib/email/reservas";

/**
 * Dispara a mano el mail "¡Tu reserva está confirmada!" para un pedido ya
 * cargado (por ejemplo, una reserva ingresada directo a la base desde
 * WhatsApp/teléfono, que no pasó por el checkout online). Protegida con
 * INTERNAL_ACTION_SECRET en vez de sesión de staff porque se dispara desde
 * fuera del navegador.
 */
async function ejecutar(pedidoId: string | null, cc: string | null) {
  if (!pedidoId) {
    return NextResponse.json({ error: "Falta pedidoId." }, { status: 400 });
  }

  const resultado = await enviarMailConfirmacionReserva(pedidoId, {
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
 * Variante GET con el secreto por query param, solo para dispararla desde
 * herramientas que no arman un POST con headers (ver uso puntual del
 * deploy). Mismo secreto que la variante POST.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.INTERNAL_ACTION_SECRET;

  if (!secret || url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return ejecutar(url.searchParams.get("pedidoId"), url.searchParams.get("cc"));
}
