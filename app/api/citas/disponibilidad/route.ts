import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { generarAgendaDisponible } from "@/lib/citas";
import { addDays } from "@/lib/disponibilidad";
import { AGENDA_MODISTA } from "@/lib/site-config";

function horaActualMontevideo(): string {
  const formateada = new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Montevideo",
    hour: "2-digit",
    minute: "2-digit",
  });
  // Node/ICU a veces mete un espacio raro (NBSP) antes de "a. m./p. m." —
  // acá no debería pasar al no pedir hour12, pero nos curamos en salud.
  return formateada.replace(/[^\d:]/g, "");
}

export async function GET() {
  const supabase = getSupabaseServiceClient();

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Montevideo" });
  const horaActual = horaActualMontevideo();
  const hasta = addDays(hoy, AGENDA_MODISTA.semanasVisibles * 7);

  const [{ data: closed }, { data: ocupadas }] = await Promise.all([
    supabase.from("closed_dates").select("fecha"),
    supabase
      .from("citas_modista")
      .select("fecha, hora")
      .eq("estado", "confirmada")
      .gte("fecha", hoy)
      .lte("fecha", hasta),
  ]);

  const closedDates = new Set((closed ?? []).map((d) => d.fecha as string));
  const ocupados = new Set(
    (ocupadas ?? []).map((o) => `${o.fecha}|${o.hora}` as string)
  );

  const agenda = generarAgendaDisponible({ hoy, horaActual, closedDates, ocupados });

  return NextResponse.json({ agenda });
}
