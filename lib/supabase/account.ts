import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Cart, CartItem, Client, Reservation, TipoCarrito } from "@/lib/supabase/types";

export async function fetchClientForUser(userId: string): Promise<Client | null> {
  const { data, error } = await getSupabaseClient()
    .from("clients")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Crea la fila en `clients` la primera vez que hay una sesión autenticada
 * (cubre tanto el alta inmediata como el caso en que Supabase exige
 * confirmar el email antes de tener sesión).
 */
export async function ensureClientRow(user: User): Promise<Client> {
  const existing = await fetchClientForUser(user.id);
  if (existing) return existing;

  const nombre = (user.user_metadata?.nombre as string | undefined) || user.email || "Clienta";
  const celular = (user.user_metadata?.celular as string | undefined) || "";

  const { data, error } = await getSupabaseClient()
    .from("clients")
    .insert({
      auth_user_id: user.id,
      nombre,
      celular,
      email: user.email ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchReservations(clientId: string): Promise<Reservation[]> {
  const { data, error } = await getSupabaseClient()
    .from("reservations")
    .select("*, products(*)")
    .eq("client_id", clientId)
    .order("fecha_retiro", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Reservation[];
}

async function findCart(clientId: string): Promise<Cart | null> {
  const { data, error } = await getSupabaseClient()
    .from("carts")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getOrCreateCart(clientId: string): Promise<Cart> {
  const existing = await findCart(clientId);
  if (existing) return existing;

  const { data, error } = await getSupabaseClient()
    .from("carts")
    .insert({ client_id: clientId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchCartItems(clientId: string): Promise<CartItem[]> {
  const cart = await findCart(clientId);
  if (!cart) return [];

  const { data, error } = await getSupabaseClient()
    .from("cart_items")
    .select("*, products(*)")
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CartItem[];
}

/** Devuelve true si se agregó, false si ya estaba en el carrito. */
export async function addToCart(
  clientId: string,
  productId: string,
  tipo: TipoCarrito
): Promise<boolean> {
  const cart = await getOrCreateCart(clientId);
  const { error } = await getSupabaseClient()
    .from("cart_items")
    .insert({ cart_id: cart.id, product_id: productId, tipo });

  if (error) {
    if (error.code === "23505") return false; // ya estaba en el carrito
    throw error;
  }
  return true;
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  const { error } = await getSupabaseClient().from("cart_items").delete().eq("id", cartItemId);
  if (error) throw error;
}
