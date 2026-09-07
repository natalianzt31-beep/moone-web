import "server-only";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";
import { enviarRecordatorioRetiro } from "@/lib/email/reservas";
import { resendConfigurado } from "@/lib/email/resend";
import { crearPreferenciaSaldo } from "@/lib/mercadopago-saldo";

type Producto = { id: string; nombre: string };
type Cliente = { nombre: string; email: string | null };

type FilaReserva = {
  id: string;
  fecha_retiro: string;
  precio_total: number;
  senia: number;
  products: Producto | Producto[] | null;
  clients: Cliente | Cliente[] | null;
};

function primero<T>(valor: T | T[] | null): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function mananaEnMontevideo(): string {
  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return manana.toLocaleDateString("en-CA", { timeZone: "America/Montevideo" });
}

/**
 * Busca reservas que retiran mañana, con la seña confirmada pero el saldo
 * todavía pendiente, y les manda el recordatorio con el link para pagar el
 * saldo online (o instrucciones para pagarlo al retirar si Mercado Pago no
 * pudo generar el link). Marca recordatorio_retiro_enviado_at para no
 * mandarlo dos veces.
 */
export async function enviarRecordatoriosDeRetiro(
  origin: string
): Promise<{ enviados: number; sinEmail: number }> {
  if (!resendConfigurado()) {
    return { enviados: 0, sinEmail: 0 };
  }

  const supabase = getSupabaseServiceClient();
  const fecha = mananaEnMontevideo();

  const { data, error } = await supabase
    .from("reservations")
    .select("id, fecha_retiro, precio_total, senia, products(id, nombre), clients(nombre, email)")
    .eq("fecha_retiro", fecha)
    .eq("senia_confirmada", true)
    .eq("saldo_pagado", false)
    .neq("estado", "cancelado")
    .is("recordatorio_retiro_enviado_at", null);

  const reservas = (data ?? []) as unknown as FilaReserva[];
  if (error || reservas.length === 0) {
    return { enviados: 0, sinEmail: 0 };
  }

  let enviados = 0;
  let sinEmail = 0;

  for (const reserva of reservas) {
    const producto = primero(reserva.products);
    const cliente = primero(reserva.clients);

    if (!cliente?.email) {
      sinEmail += 1;
      continue;
    }

    const saldoPendiente = reserva.precio_total - reserva.senia;
    const linkPagoSaldo = producto
      ? await crearPreferenciaSaldo({
          reservationId: reserva.id,
          productoId: producto.id,
          productoNombre: producto.nombre,
          monto: saldoPendiente,
          origin,
        })
      : null;

    const resultado = await enviarRecordatorioRetiro({
      reservationId: reserva.id,
      clienteEmail: cliente.email,
      clienteNombre: cliente.nombre,
      productoNombre: producto?.nombre ?? "tu prenda",
      fechaRetiro: reserva.fecha_retiro,
      saldoPendiente,
      linkPagoSaldo,
    });

    if (resultado.ok) {
      enviados += 1;
      await supabase
        .from("reservations")
        .update({ recordatorio_retiro_enviado_at: new Date().toISOString() })
        .eq("id", reserva.id);
    }
  }

  return { enviados, sinEmail };
}
