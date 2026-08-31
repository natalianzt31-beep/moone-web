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

  let body: { productId?: string; fechaRetiro?: string; fechaDevolucion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { productId, fechaRetiro, fechaDevolucion } = body;
  if (!productId || !fechaRetiro || !fechaDevolucion) {
    return NextResponse.json(
      { error: "Faltan productId, fechaRetiro o fechaDevolucion." },
      { status: 400 }
    );
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
    .select("id, nombre, precio_alquiler")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "No encontramos esa prenda." }, { status: 404 });
  }

  const precioTotal = product.precio_alquiler;
  const senia = Math.round(precioTotal * 0.5);
  const origin = new URL(req.url).origin;

  // La reserva todavía no existe: se crea recién cuando el webhook confirma
  // el pago. Toda la información necesaria para crearla en ese momento
  // viaja en metadata, que Mercado Pago devuelve tal cual en el Payment.
  try {
    const preference = await new Preference(getMercadoPagoConfig()).create({
      body: {
        items: [
          {
            id: product.id,
            title: `Seña — ${product.nombre}`,
            quantity: 1,
            unit_price: senia,
            currency_id: "UYU",
          },
        ],
        metadata: {
          product_id: product.id,
          client_id: client.id,
          fecha_retiro: fechaRetiro,
          fecha_devolucion: fechaDevolucion,
          precio_total: precioTotal,
          senia,
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
    console.error("Error creando la preferencia de Mercado Pago", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 500 }
    );
  }
}
