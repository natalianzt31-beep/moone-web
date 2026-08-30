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

export async function fetchClosedDatesSet(): Promise<Set<string>> {
  const dates = await fetchClosedDates();
  return new Set(dates.map((d) => d.fecha));
}
