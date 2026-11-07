import { getSupabaseClient } from "@/lib/supabase/client";
import type { PedidoMedida, PedidoMedidaCobro } from "@/lib/supabase/types";

/** Vista para Cobros (admin/caja): incluye pagado, saldo y datos de la clienta. */
export async function fetchPedidosMedidaCobros(): Promise<PedidoMedidaCobro[]> {
  const { data, error } = await getSupabaseClient()
    .from("pedidos_medida_cobros")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Tabla directa para la modista: no expone pagos, pero sí el presupuesto. */
export async function fetchPedidosMedida(): Promise<PedidoMedida[]> {
  const { data, error } = await getSupabaseClient()
    .from("pedidos_medida")
    .select("*, clients(nombre, celular, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PedidoMedida[];
}

export async function pmCrear(params: {
  nombre: string;
  ci: string;
  email: string;
  celular: string;
  monto: number;
  descripcion?: string;
  seniaPorcentaje?: number;
}): Promise<string> {
  const { data, error } = await getSupabaseClient().rpc("pm_crear", {
    p_nombre: params.nombre,
    p_ci: params.ci,
    p_email: params.email,
    p_celular: params.celular,
    p_monto: params.monto,
    p_descripcion: params.descripcion ?? null,
    p_senia_porcentaje: params.seniaPorcentaje ?? 50,
  });
  if (error) throw error;
  return data as string;
}

export async function pmTerminar(pedidoId: string, fechaRetiro: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pm_terminar", {
    p_pedido: pedidoId,
    p_fecha_retiro: fechaRetiro,
  });
  if (error) throw error;
}

export async function pmFacturar(pedidoId: string, numero: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pm_facturar", {
    p_pedido: pedidoId,
    p_numero: numero,
  });
  if (error) throw error;
}

export async function pmEntregar(pedidoId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pm_entregar", { p_pedido: pedidoId });
  if (error) throw error;
}

export async function pmCancelar(pedidoId: string, motivo: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("pm_cancelar", {
    p_pedido: pedidoId,
    p_motivo: motivo,
  });
  if (error) throw error;
}
