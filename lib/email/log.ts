import "server-only";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export type TipoEmailLog =
  | "confirmacion_reserva"
  | "recordatorio_retiro"
  | "eticket"
  | "recordatorio_devolucion"
  | "pedido_resena"
  | "promocion";

/**
 * Deja constancia en email_log de cada intento de envío (éxito o error),
 * para poder auditar desde la base sin depender solo de los logs de
 * Vercel. Nunca lanza: un fallo acá no puede tirar abajo el flujo que
 * ya mandó (o intentó mandar) el mail.
 */
export async function registrarEnvioEmail(params: {
  tipo: TipoEmailLog;
  destinatario: string;
  reservationId?: string | null;
  resultado: { ok: true; id?: string } | { ok: false; reason: string };
}): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();
    await supabase.from("email_log").insert({
      tipo: params.tipo,
      destinatario: params.destinatario,
      reservation_id: params.reservationId ?? null,
      estado_envio: params.resultado.ok ? "enviado" : "error",
      fecha_envio: params.resultado.ok ? new Date().toISOString() : null,
      proveedor_msg_id: params.resultado.ok ? (params.resultado.id ?? null) : null,
    });
  } catch (err) {
    console.error("[email_log] No se pudo registrar el envío", err);
  }
}
