import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { enviarYRegistrarAlertaArreglos, type ArregloPorAlertar } from "@/lib/email/arreglos";

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

  const supabase = getSupabaseServiceClient();

  const { data: filas, error } = await supabase.rpc("pa_por_alertar");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pendientes = (filas ?? []) as ArregloPorAlertar[];
  if (pendientes.length === 0) {
    return NextResponse.json({ ok: true, avisados: 0 });
  }

  const resultado = await enviarYRegistrarAlertaArreglos(pendientes);
  if (!resultado.ok) {
    return NextResponse.json({ ok: false, reason: resultado.reason });
  }

  const { data: n, error: errorMarcar } = await supabase.rpc("pa_marcar_alertados", {
    p_ids: pendientes.map((a) => a.id),
  });
  if (errorMarcar) {
    return NextResponse.json({ error: errorMarcar.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, avisados: n ?? pendientes.length });
}
