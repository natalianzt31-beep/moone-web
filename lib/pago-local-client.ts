import { getSupabaseClient } from "@/lib/supabase/client";

async function getAccessTokenOrThrow(): Promise<string> {
  const { data: sessionData } = await getSupabaseClient().auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error("Tu sesión expiró. Volvé a iniciar sesión e intentá de nuevo.");
  }
  return accessToken;
}

/**
 * Reserva un alquiler para pagar en el local (efectivo/transferencia/POS) en
 * vez de con Mercado Pago. A diferencia del pago online, la reserva se crea
 * de inmediato (para bloquear las fechas) pero queda pendiente de que la
 * vendedora confirme el pago desde el backoffice.
 */
export async function crearReservaLocal({
  productId,
  fechaRetiro,
  fechaDevolucion,
}: {
  productId: string;
  fechaRetiro: string;
  fechaDevolucion: string;
}): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();

  const res = await fetch("/api/reservas/crear-local", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ productId, fechaRetiro, fechaDevolucion }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "No se pudo registrar la reserva.");
  }
}

/**
 * Pide comprar una prenda en venta definitiva pagando en el local. La prenda
 * queda reservada y el pedido pendiente de que la vendedora confirme el pago
 * recibido desde el backoffice.
 */
export async function crearPedidoLocalVenta({ productId }: { productId: string }): Promise<void> {
  const accessToken = await getAccessTokenOrThrow();

  const res = await fetch("/api/ventas/crear-pedido-local", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ productId }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "No se pudo registrar el pedido.");
  }
}
