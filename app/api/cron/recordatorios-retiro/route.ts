import { NextResponse } from "next/server";
import { enviarRecordatoriosDeRetiro } from "@/lib/reservas/recordatorioRetiro";

/**
 * Disparado por el cron de Vercel (ver vercel.json). Vercel manda
 * Authorization: Bearer $CRON_SECRET en estas llamadas.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const origin = new URL(req.url).origin;
  const resultado = await enviarRecordatoriosDeRetiro(origin);
  return NextResponse.json(resultado);
}
