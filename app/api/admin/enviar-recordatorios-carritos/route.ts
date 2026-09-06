import { NextResponse } from "next/server";
import { getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import { enviarRecordatoriosCarritosAbandonados } from "@/lib/marketing/carritoAbandonado";

/** Disparo manual desde /admin/analitica, para probar o adelantar el envío diario. */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  const userSupabase = getSupabaseUserClient(accessToken);
  const { data: esStaff } = await userSupabase.rpc("is_staff");
  if (!esStaff) {
    return NextResponse.json({ error: "No autorizada." }, { status: 403 });
  }

  const resultado = await enviarRecordatoriosCarritosAbandonados();
  return NextResponse.json(resultado);
}
