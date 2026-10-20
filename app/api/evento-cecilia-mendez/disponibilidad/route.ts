import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { horariosEventoPosibles } from "@/lib/citasEvento";
import { EVENTO_CECILIA_MENDEZ } from "@/lib/site-config";

function horaActualMontevideo(): string {
  const formateada = new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Montevideo",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formateada.replace(/[^\d:]/g, "");
}

export async function GET() {
  const supabase = getSupabaseServiceClient();
  const { fecha } = EVENTO_CECILIA_MENDEZ;

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Montevideo" });

  const { data: ocupadas } = await supabase
    .from("citas_cecilia_mendez")
    .select("hora")
    .eq("fecha", fecha)
    .eq("estado", "confirmada");

  const ocupados = new Set((ocupadas ?? []).map((o) => o.hora as string));

  let horarios = horariosEventoPosibles().filter((h) => !ocupados.has(h));
  if (fecha === hoy) {
    const horaActual = horaActualMontevideo();
    horarios = horarios.filter((h) => h > horaActual);
  }

  return NextResponse.json({ fecha, horarios });
}
