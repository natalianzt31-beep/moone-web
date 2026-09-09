import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";
import { getSupabaseServiceClient, getSupabaseUserClient } from "@/lib/supabase/serviceClient";
import type { Categoria } from "@/lib/supabase/types";

type PromoCode = {
  codigo: string;
  porcentaje: number;
  activo: boolean;
  requiere_combo: boolean;
  categorias_requeridas: Categoria[] | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  usos_maximos: number | null;
  usos_actuales: number;
};

/**
 * Preferencia de Mercado Pago para la seña de varias prendas de alquiler
 * reservadas juntas (mismo pedido_id), con un código de descuento
 * opcional. El código se re-valida acá server-side — nunca hay que
 * confiar en el porcentaje que mande el navegador.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  let body: {
    productIds?: string[];
    fechaRetiro?: string;
    fechaDevolucion?: string;
    promoCode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { productIds, fechaRetiro, fechaDevolucion, promoCode } = body;
  if (!productIds || productIds.length === 0 || !fechaRetiro || !fechaDevolucion) {
    return NextResponse.json(
      { error: "Faltan productIds, fechaRetiro o fechaDevolucion." },
      { status: 400 }
    );
  }

  const userSupabase = getSupabaseUserClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await userSupabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { data: client, error: clientError } = await userSupabase
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "No encontramos tu cuenta de clienta." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, nombre, categoria, precio_alquiler, estado")
    .in("id", productIds);

  if (productsError || !products || products.length !== productIds.length) {
    return NextResponse.json({ error: "No encontramos alguna de esas prendas." }, { status: 404 });
  }

  const noDisponible = products.find((p) => p.estado !== "disponible");
  if (noDisponible) {
    return NextResponse.json(
      { error: `"${noDisponible.nombre}" ya no está disponible.` },
      { status: 409 }
    );
  }

  let porcentaje = 0;
  let codigoValido: string | null = null;

  if (promoCode?.trim()) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select(
        "codigo, porcentaje, activo, requiere_combo, categorias_requeridas, fecha_inicio, fecha_fin, usos_maximos, usos_actuales"
      )
      .ilike("codigo", promoCode.trim())
      .eq("activo", true)
      .maybeSingle<PromoCode>();

    if (!promo) {
      return NextResponse.json({ error: "Código de descuento inválido." }, { status: 400 });
    }

    const hoy = new Date().toISOString().slice(0, 10);
    if (promo.fecha_inicio && hoy < promo.fecha_inicio) {
      return NextResponse.json({ error: "Ese código todavía no está vigente." }, { status: 400 });
    }
    if (promo.fecha_fin && hoy > promo.fecha_fin) {
      return NextResponse.json({ error: "Ese código ya venció." }, { status: 400 });
    }
    if (promo.usos_maximos != null && promo.usos_actuales >= promo.usos_maximos) {
      return NextResponse.json(
        { error: "Ese código alcanzó el máximo de usos." },
        { status: 400 }
      );
    }
    if (promo.requiere_combo) {
      const categoriasEnPedido = new Set(products.map((p) => p.categoria));
      const cumple = (promo.categorias_requeridas ?? []).every((cat) =>
        categoriasEnPedido.has(cat)
      );
      if (!cumple) {
        return NextResponse.json(
          { error: "Ese código requiere una combinación de prendas que no está en tu pedido." },
          { status: 400 }
        );
      }
    }

    porcentaje = promo.porcentaje;
    codigoValido = promo.codigo;
  }

  // La seña de cada prenda se calcula sobre su propio precio ya con el
  // descuento aplicado, para que cada reserva quede con su precio_total y
  // su senia correctos (la suma es la que ve enviarMailConfirmacionReserva).
  const itemsPedido = products.map((p) => {
    const descuentoItem = Math.round((p.precio_alquiler * porcentaje) / 100);
    const precioTotal = p.precio_alquiler - descuentoItem;
    const senia = Math.round(precioTotal * 0.5);
    return { productId: p.id, nombre: p.nombre, precioTotal, senia };
  });

  const seniaTotal = itemsPedido.reduce((sum, i) => sum + i.senia, 0);
  const pedidoId = crypto.randomUUID();
  const origin = new URL(req.url).origin;

  const titulo =
    itemsPedido.length === 1
      ? `Seña — ${itemsPedido[0].nombre}`
      : `Seña — ${itemsPedido.length} prendas (Môone)`;

  try {
    const preference = await new Preference(getMercadoPagoConfig()).create({
      body: {
        items: [
          {
            id: pedidoId,
            title: titulo,
            quantity: 1,
            unit_price: seniaTotal,
            currency_id: "UYU",
          },
        ],
        metadata: {
          tipo: "alquiler_multiple",
          pedido_id: pedidoId,
          client_id: client.id,
          fecha_retiro: fechaRetiro,
          fecha_devolucion: fechaDevolucion,
          promo_codigo: codigoValido,
          // JSON como string: la metadata de Mercado Pago es más confiable
          // con valores planos que con arrays/objetos anidados.
          items_json: JSON.stringify(
            itemsPedido.map((i) => ({
              product_id: i.productId,
              precio_total: i.precioTotal,
              senia: i.senia,
            }))
          ),
        },
        back_urls: {
          success: `${origin}/mi-cuenta/reserva-confirmada`,
          pending: `${origin}/mi-cuenta/reserva-confirmada`,
          failure: `${origin}/mi-cuenta/reserva-confirmada`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/webhooks/mercadopago`,
      },
    });

    return NextResponse.json({ initPoint: preference.init_point });
  } catch (err) {
    console.error("Error creando la preferencia de Mercado Pago (carrito)", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 500 }
    );
  }
}
