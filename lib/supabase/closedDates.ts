import { getSupabaseClient } from "@/lib/supabase/client";
import type { ClosedDate } from "@/lib/supabase/types";

export async function fetchClosedDates(): Promise<ClosedDate[]> {
  const { data, error } = await getSupabaseClient()
    .from("closed_dates")
    .select("*")
    .order("fecha");

  if (error) throw error;
  return data ?? [];
}

/**
 * Para el alquiler (retiro/devolución): un cierre marcado "solo_modista" no
 * cuenta acá, porque ese día el local abre normal para alquiler — solo no
 * atiende confección a medida (ver citas_modista / lib/citas.ts, que sí
 * sigue viendo esas fechas al consultar closed_dates directo).
 */
export async function fetchClosedDatesSet(): Promise<Set<string>> {
  const dates = await fetchClosedDates();
  return new Set(dates.filter((d) => !d.solo_modista).map((d) => d.fecha));
}
