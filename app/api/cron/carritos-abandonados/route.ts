import { NextResponse } from "next/server";
import { enviarRecordatoriosCarritosAbandonados } from "@/lib/marketing/carritoAbandonado";

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

  const resultado = await enviarRecordatoriosCarritosAbandonados();
  return NextResponse.json(resultado);
}
