import { getSupabaseClient } from "@/lib/supabase/client";

// Misma sesión anónima que usa VisitTracker para page_views.
const STORAGE_KEY = "moone_visit_session_id";

export type EventoReco = "mostrada" | "click" | "agregada";
export type OrigenReco = "ficha" | "post_agregar" | "carrito";

function sessionId(): string | null {
  try {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** Registra un evento de recomendación. Nunca tira error ni bloquea. */
export async function trackRecomendacion(datos: {
  evento: EventoReco;
  origen: OrigenReco;
  productoBaseId?: string | null;
  productoId?: string | null;
  cantidad?: number;
}) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  const id = sessionId();
  if (!id) return;
  try {
    const { data } = await getSupabaseClient().auth.getSession();
    const token = data.session?.access_token;
    await fetch("/api/track-recomendacion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sessionId: id, ...datos }),
      keepalive: true,
    });
  } catch {
    // La analítica no es crítica.
  }
}
