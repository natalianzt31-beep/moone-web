import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Pide al backend que cree la preferencia de pago de Mercado Pago para la
 * seña de un alquiler y devuelve la URL de pago. No crea la reserva: eso
 * pasa recién cuando Mercado Pago confirma el pago vía webhook.
 */
export async function crearPreferenciaReserva({
  productId,
  fechaRetiro,
  fechaDevolucion,
}: {
  productId: string;
  fechaRetiro: string;
  fechaDevolucion: string;
}): Promise<string> {
  const { data: sessionData } = await getSupabaseClient().auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error("Tu sesión expiró. Volvé a iniciar sesión e intentá de nuevo.");
  }

  const res = await fetch("/api/mercadopago/crear-preferencia", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ productId, fechaRetiro, fechaDevolucion }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "No se pudo iniciar el pago.");
  }

  return json.initPoint as string;
}
