import { getSupabaseClient } from "@/lib/supabase/client";
import type { Categoria, PromoCode } from "@/lib/supabase/types";

export type PromoValidationResult =
  | { ok: true; promo: PromoCode }
  | { ok: false; message: string };

export async function validatePromoCode(
  codigoIngresado: string,
  categoriasEnCarrito: Set<Categoria>
): Promise<PromoValidationResult> {
  const codigo = codigoIngresado.trim();
  if (!codigo) return { ok: false, message: "Ingresá un código." };

  const { data, error } = await getSupabaseClient()
    .from("promo_codes")
    .select("*")
    .eq("activo", true);

  if (error) return { ok: false, message: error.message };

  const promo = (data as PromoCode[] | null)?.find(
    (p) => p.codigo.toLowerCase() === codigo.toLowerCase()
  );

  if (!promo) return { ok: false, message: "Código inválido." };

  const hoy = new Date().toISOString().slice(0, 10);
  if (promo.fecha_inicio && hoy < promo.fecha_inicio) {
    return { ok: false, message: "Este código todavía no está vigente." };
  }
  if (promo.fecha_fin && hoy > promo.fecha_fin) {
    return { ok: false, message: "Este código ya venció." };
  }
  if (promo.usos_maximos != null && promo.usos_actuales >= promo.usos_maximos) {
    return { ok: false, message: "Este código alcanzó el máximo de usos." };
  }
  if (promo.requiere_combo) {
    const cumple = promo.categorias_requeridas.every((cat) => categoriasEnCarrito.has(cat));
    if (!cumple) {
      return { ok: false, message: "Este código aplica alquilando vestido + sandalias juntos" };
    }
  }

  return { ok: true, promo };
}

export async function registrarUsoPromoCode(codigo: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("increment_promo_code_uso", {
    p_codigo: codigo,
  });
  if (error) throw error;
}
