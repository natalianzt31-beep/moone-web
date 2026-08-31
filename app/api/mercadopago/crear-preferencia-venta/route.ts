import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago";
import { getSupabaseUserClient } from "@/lib/supabase/serviceClient";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticada." }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { productId } = body;
  if (!productId) {
    return NextResponse.json({ error: "Falta productId." }, { status: 400 });
  }

  const supabase = getSupabaseUserClient(accessToken);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "No encontramos tu cuenta de clienta." }, { status: 400 });
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, nombre, precio_venta, estado")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "No encontramos esa prenda." }, { status: 404 });
  }

  if (product.estado !== "disponible" || product.precio_venta == null) {
    return NextResponse.json({ error: "Esta prenda ya no está disponible." }, { status: 409 });
  }

  const origin = new URL(req.url).origin;

  // El producto todavía no se marca como vendido acá: eso pasa recién
  // cuando el webhook confirma el pago aprobado, para no bloquear la
  // prenda si alguien abandona el pago a mitad de camino.
  try {
    const preference = await new Preference(getMercadoPagoConfig()).create({
      body: {
        items: [
          {
            id: product.id,
            title: product.nombre,
            quantity: 1,
            unit_price: product.precio_venta,
            currency_id: "UYU",
          },
        ],
        metadata: {
          tipo: "venta",
          product_id: product.id,
          client_id: client.id,
          precio_venta: product.precio_venta,
        },
        back_urls: {
          success: `${origin}/mi-cuenta/compra-confirmada`,
          pending: `${origin}/mi-cuenta/compra-confirmada`,
          failure: `${origin}/mi-cuenta/compra-confirmada`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/webhooks/mercadopago`,
      },
    });

    return NextResponse.json({ initPoint: preference.init_point });
  } catch (err) {
    console.error("Error creando la preferencia de Mercado Pago (venta)", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 500 }
    );
  }
}
