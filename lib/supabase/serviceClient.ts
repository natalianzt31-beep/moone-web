import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only: bypasea RLS con la service_role key. Nunca importar este
 * módulo desde un componente "use client" ni exponer su resultado al
 * navegador. Se usa donde no hay sesión de usuario (ej. el webhook de
 * Mercado Pago, que Mercado Pago llama server-to-server).
 */
export function getSupabaseServiceClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Server-only: cliente con la anon key pero autenticado como la clienta que
 * hizo el pedido (vía su access_token), para que las políticas RLS que
 * dependen de auth.uid() se apliquen igual que si llamara desde el navegador.
 */
export function getSupabaseUserClient(accessToken: string): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
