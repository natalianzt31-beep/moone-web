import { NextResponse } from "next/server";
import { getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { enviarMailPagoRecibido } from "@/lib/email/pedidosMedida";

/**
 * Registra un pago (seña o saldo) de un pedido a medida vía pm_registrar_pago
 * (que valida rol, estado y que no se pague de más) y, si salió bien, manda
 * el mail "Recibimos tu pago". Pasa por una ruta y no por rpc directo del
 * cliente porque el mail solo puede enviarse server-side.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  let body: { pedidoId?: string; monto?: number; medio?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { pedidoId, monto, medio } = body;
  if (!pedidoId || !monto || !medio) {
    return NextResponse.json({ error: "Faltan pedidoId, monto o medio." }, { status: 400 });
  }

  const userSupabase = getSupabaseUserClient(accessToken);

  const { data: pedidoAntes } = await userSupabase
    .from("pedidos_medida")
    .select("estado")
    .eq("id", pedidoId)
    .single();
  const tipo: "seña" | "saldo" = pedidoAntes?.estado === "pendiente_senia" ? "seña" : "saldo";

  const { error } = await userSupabase.rpc("pm_registrar_pago", {
    p_pedido: pedidoId,
    p_monto: monto,
    p_medio: medio,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const resultadoMail = await enviarMailPagoRecibido({ pedidoId, monto, tipo });

  return NextResponse.json({ ok: true, mailEnviado: resultadoMail.ok });
}
