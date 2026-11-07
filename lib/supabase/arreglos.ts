import { getSupabaseClient } from "@/lib/supabase/client";
import type { ArregloBandeja } from "@/lib/supabase/types";

/** Bandeja (Cobros y Modista comparten la misma vista, sin datos de la clienta). */
export async function fetchArreglosBandeja(): Promise<ArregloBandeja[]> {
  const { data, error } = await getSupabaseClient()
    .from("arreglos_bandeja")
    .select("*")
    .order("fecha_retiro_clienta")
    .order("numero");
  if (error) throw error;
  return data ?? [];
}

export async function paCrear(params: {
  sku: string;
  detalle: string;
  fechaRetiro?: string | null;
  reservationId?: string | null;
}): Promise<string> {
  const { data, error } = await getSupabaseClient().rpc("pa_crear", {
    p_sku: params.sku,
    p_detalle: params.detalle,
    p_fecha_retiro: params.fechaRetiro ?? null,
    p_reservation_id: params.reservationId ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function paActualizar(
  id: string,
  detalle: string,
  fechaRetiro: string
): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pa_actualizar", {
    p_id: id,
    p_detalle: detalle,
    p_fecha_retiro: fechaRetiro,
  });
  if (error) throw error;
}

export async function paMarcarPronto(id: string, nota?: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pa_marcar_pronto", {
    p_id: id,
    p_nota: nota ?? null,
  });
  if (error) throw error;
}

export async function paReabrir(id: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pa_reabrir", { p_id: id });
  if (error) throw error;
}

export async function paCancelar(id: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pa_cancelar", { p_id: id });
  if (error) throw error;
}
