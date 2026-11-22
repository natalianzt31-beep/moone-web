"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { bookingEnabled, checkoutEnabled } from "@/lib/features";
import { currencyFormatter } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase/client";
import { addToCart, fetchCartItems } from "@/lib/supabase/account";
import { CART_UPDATED_EVENT, notifyCartUpdated } from "@/lib/cartEvents";
import {
  guardarPedidoPendiente,
  leerPedidoPendiente,
  limpiarPedidoPendiente,
} from "@/lib/pendingCartItem";
import {
  categoriasFaltantes,
  imprescindibles,
  rangosSeSuperponen,
  recomendar,
  type Recomendacion,
  type RecoProducto,
} from "@/lib/recomendaciones/motor";
import { trackRecomendacion, type OrigenReco } from "@/lib/recomendaciones/tracking";
import { IMPRESCINDIBLES_SUBCATEGORIAS } from "@/lib/recomendaciones/reglas";
import { FILTRO_SIN_SEFORA } from "@/lib/site-config";
import type { Categoria } from "@/lib/supabase/types";

const CAMPOS =
  "id, sku, nombre, categoria, subcategoria, talle, color, precio_alquiler, precio_venta, slug, grupo_producto, estado, foto_url, fotos, created_at, destacado, estilo, ocasiones_uso";

let cacheImprescindibles: Promise<RecoProducto[]> | null = null;

function cargarImprescindibles(): Promise<RecoProducto[]> {
  if (!cacheImprescindibles) {
    cacheImprescindibles = Promise.resolve(
      getSupabaseClient()
        .from("products")
        .select(CAMPOS)
        .in("subcategoria", IMPRESCINDIBLES_SUBCATEGORIAS)
        .eq("visible_web", true)
        .eq("disponible", true)
        .eq("estado", "disponible")
        .gt("stock", 0)
    ).then(({ data, error }) => {
      if (error) {
        cacheImprescindibles = null;
        throw error;
      }
      return (data ?? []) as RecoProducto[];
    });
  }
  return cacheImprescindibles;
}

// El catálogo candidato se pide una sola vez por carga de página y se
// comparte entre todos los módulos (ficha + carrito, etc.).
const cacheCatalogo = new Map<string, Promise<RecoProducto[]>>();

function cargarCatalogo(categorias: Categoria[]): Promise<RecoProducto[]> {
  const clave = [...categorias].sort().join(",");
  let promesa = cacheCatalogo.get(clave);
  if (!promesa) {
    promesa = Promise.resolve(
      getSupabaseClient()
        .from("products")
        .select(CAMPOS)
        .in("categoria", categorias)
        // Lencería y trajes de baño de Séfora no completan un look de fiesta.
        .or(FILTRO_SIN_SEFORA)
        .eq("visible_web", true)
        .eq("disponible", true)
        .eq("estado", "disponible")
    ).then(({ data, error }) => {
      if (error) {
        cacheCatalogo.delete(clave);
        throw error;
      }
      return (data ?? []) as RecoProducto[];
    });
    cacheCatalogo.set(clave, promesa);
  }
  return promesa;
}

async function cargarOcupados(fechas: { retiro: string; devolucion: string }): Promise<Set<string>> {
  // reservations_disponibilidad ya excluye canceladas y devueltas.
  const { data } = await getSupabaseClient()
    .from("reservations_disponibilidad")
    .select("product_id, fecha_retiro, fecha_devolucion")
    .lte("fecha_retiro", fechas.devolucion)
    .gte("fecha_devolucion", fechas.retiro);
  const ocupados = new Set<string>();
  for (const r of (data ?? []) as { product_id: string; fecha_retiro: string; fecha_devolucion: string }[]) {
    if (
      rangosSeSuperponen(
        { desde: r.fecha_retiro, hasta: r.fecha_devolucion },
        { desde: fechas.retiro, hasta: fechas.devolucion }
      )
    ) {
      ocupados.add(r.product_id);
    }
  }
  return ocupados;
}

type Props = {
  /** Lo que la clienta está mirando o ya eligió. */
  seleccion: RecoProducto[];
  origen: OrigenReco;
  fechas?: { retiro: string; devolucion: string } | null;
  titulo?: string;
  subtitulo?: string;
  /** Mínimo de recomendaciones para mostrar el módulo. */
  min?: number;
  max?: number;
  /** Sumar el carrito de la clienta a la selección (para no repetir). */
  incluirCarrito?: boolean;
  /** IDs que ya están en el carrito (cuando incluirCarrito es false). */
  excluirIds?: string[];
};

export function CompletaTuLook({
  seleccion,
  origen,
  fechas = null,
  titulo = "Completá tu look ✨",
  subtitulo = "Encontramos estos complementos para vos",
  min = 3,
  max = 6,
  incluirCarrito = true,
  excluirIds = [],
}: Props) {
  const { client, user, loading: authLoading } = useAuth();
  const [catalogo, setCatalogo] = useState<RecoProducto[] | null>(null);
  const [carrito, setCarrito] = useState<RecoProducto[]>([]);
  const [idsCarrito, setIdsCarrito] = useState<string[]>([]);
  const [catalogoImprescindibles, setCatalogoImprescindibles] = useState<RecoProducto[] | null>(null);
  const [ocupadosCargados, setOcupadosCargados] = useState<{ clave: string; ids: Set<string> } | null>(
    null
  );
  const [agregados, setAgregados] = useState<Set<string>>(new Set());
  // Lo que se agregó desde acá queda visible con su ✓ aunque el carrito ya
  // lo excluya del cálculo, para que la grilla no se mueva.
  const [fijadas, setFijadas] = useState<Recomendacion[]>([]);

  const puedeAgregar = bookingEnabled;
  const productoBaseId = seleccion[0]?.id ?? null;
  const claveSeleccion = seleccion.map((p) => p.id).join(",");

  // Carrito de la clienta: lo ya elegido no se vuelve a ofrecer.
  useEffect(() => {
    if (!incluirCarrito || !(bookingEnabled || checkoutEnabled) || authLoading || !client) return;
    let cancelled = false;
    const clientId = client.id;
    async function load() {
      try {
        const items = await fetchCartItems(clientId);
        if (!cancelled) {
          setIdsCarrito(items.map((i) => i.product_id));
          setCarrito(
            items
              .filter((i) => i.tipo === "alquiler" && i.products)
              .map((i) => i.products as unknown as RecoProducto)
          );
        }
      } catch {
        // Si falla el carrito, igual recomendamos sobre la prenda actual.
      }
    }
    load();
    window.addEventListener(CART_UPDATED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_UPDATED_EVENT, load);
    };
  }, [incluirCarrito, authLoading, client]);

  useEffect(() => {
    let cancelled = false;
    cargarImprescindibles()
      .then((data) => {
        if (!cancelled) setCatalogoImprescindibles(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const claveExcluir = [...excluirIds, ...idsCarrito].join(",");
  const listaImprescindibles = useMemo(
    () =>
      catalogoImprescindibles
        ? imprescindibles(catalogoImprescindibles, new Set(claveExcluir.split(",").filter(Boolean)))
        : [],
    [catalogoImprescindibles, claveExcluir]
  );
  // Lo recién agregado sigue a la vista con su ✓.
  const imprescindiblesVisibles = useMemo(() => {
    const fijas = fijadas.filter((f) => f.tipo === "venta");
    const resto = listaImprescindibles.filter((r) => !fijas.some((f) => f.clave === r.clave));
    return [...fijas, ...resto];
  }, [listaImprescindibles, fijadas]);

  const seleccionCompleta = useMemo(() => {
    const porId = new Map<string, RecoProducto>();
    for (const p of [...seleccion, ...carrito]) porId.set(p.id, p);
    return Array.from(porId.values());
  }, [seleccion, carrito]);

  const faltantes = useMemo(() => categoriasFaltantes(seleccionCompleta), [seleccionCompleta]);
  const claveFaltantes = faltantes.join(",");

  useEffect(() => {
    if (faltantes.length === 0) return;
    let cancelled = false;
    cargarCatalogo(faltantes)
      .then((data) => {
        if (!cancelled) setCatalogo(data);
      })
      .catch(() => {
        if (!cancelled) setCatalogo([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFaltantes]);

  // Con fechas elegidas, solo lo que está libre en esas fechas.
  const claveFechas = fechas ? `${fechas.retiro}|${fechas.devolucion}` : "";
  useEffect(() => {
    if (!fechas) return;
    let cancelled = false;
    const clave = `${fechas.retiro}|${fechas.devolucion}`;
    cargarOcupados(fechas)
      .then((ids) => {
        if (!cancelled) setOcupadosCargados({ clave, ids });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFechas]);

  const ocupados =
    fechas && ocupadosCargados?.clave === claveFechas ? ocupadosCargados.ids : undefined;

  const recomendaciones = useMemo(() => {
    if (!catalogo) return [];
    const lista = recomendar({ seleccion: seleccionCompleta, catalogo, ocupados, max });
    return lista.length >= min ? lista : [];
  }, [catalogo, seleccionCompleta, ocupados, max, min]);

  const mostradas = useMemo(() => {
    const fijas = fijadas.filter((f) => f.tipo === "alquiler");
    const resto = recomendaciones.filter((r) => !fijas.some((f) => f.clave === r.clave));
    return [...fijas, ...resto].slice(0, Math.max(max, fijas.length));
  }, [recomendaciones, fijadas, max]);

  function marcarAgregado(productId: string, reco?: Recomendacion) {
    setAgregados((prev) => new Set(prev).add(productId));
    const encontrada =
      reco ??
      [...recomendaciones, ...listaImprescindibles].find((r) =>
        r.variantes.some((v) => v.id === productId)
      );
    if (encontrada) {
      setFijadas((prev) => (prev.some((f) => f.clave === encontrada.clave) ? prev : [...prev, encontrada]));
    }
  }

  // Evento "mostrada": una vez por módulo y selección.
  const registrado = useRef<string | null>(null);
  const totalMostradas = mostradas.length + imprescindiblesVisibles.length;
  useEffect(() => {
    if (totalMostradas === 0) return;
    const clave = `${origen}|${claveSeleccion}`;
    if (registrado.current === clave) return;
    registrado.current = clave;
    trackRecomendacion({ evento: "mostrada", origen, productoBaseId, cantidad: totalMostradas });
  }, [totalMostradas, origen, claveSeleccion, productoBaseId]);

  // Si la clienta tocó "Agregar" sin sesión, al volver lo sumamos solo.
  const pathname = usePathname();
  useEffect(() => {
    if (authLoading || !client) return;
    const pendiente = leerPedidoPendiente();
    if (!pendiente) return;
    const fuente = pendiente.tipo === "venta" ? catalogoImprescindibles : catalogo;
    const habilitado = pendiente.tipo === "venta" ? checkoutEnabled : bookingEnabled;
    if (!habilitado || !fuente) return;
    const match = fuente.find((p) => p.id === pendiente.productId);
    if (!match) return;
    limpiarPedidoPendiente();
    addToCart(client.id, match.id, pendiente.tipo)
      .then(() => {
        marcarAgregado(match.id);
        notifyCartUpdated();
        trackRecomendacion({ evento: "agregada", origen, productoBaseId, productoId: match.id });
      })
      .catch(() => {});
    // marcarAgregado solo actualiza estado local; no hace falta re-correr por ella.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, client, catalogo, catalogoImprescindibles, origen, productoBaseId]);

  if (totalMostradas === 0) return null;

  return (
    <section aria-label={titulo} className="mt-10 border-t border-arena pt-8">
      <h2 className="font-serif text-xl font-normal tracking-tight text-negro">{titulo}</h2>
      <p className="mt-1 text-sm text-chocolate">{subtitulo}</p>

      {mostradas.length > 0 && (
        <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {mostradas.map((reco) => (
          <TarjetaComplemento
            key={reco.clave}
            reco={reco}
            origen={origen}
            productoBaseId={productoBaseId}
            puedeAgregar={puedeAgregar}
            clientId={client?.id ?? null}
            haySesion={!authLoading && Boolean(user)}
            authLoading={authLoading}
            pathname={pathname}
            agregado={reco.variantes.some((v) => agregados.has(v.id))}
            onAgregado={(id) => marcarAgregado(id, reco)}
          />
        ))}
        </div>
      )}

      {imprescindiblesVisibles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium uppercase tracking-wider text-negro">
            Imprescindibles para ese día
          </h3>
          <p className="mt-1 text-xs text-taupe">Para comprar: son tuyas y te las llevás.</p>
          <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {imprescindiblesVisibles.map((reco) => (
          <TarjetaComplemento
            key={reco.clave}
            reco={reco}
            origen={origen}
            productoBaseId={productoBaseId}
            puedeAgregar={checkoutEnabled}
            clientId={client?.id ?? null}
            haySesion={!authLoading && Boolean(user)}
            authLoading={authLoading}
            pathname={pathname}
            agregado={reco.variantes.some((v) => agregados.has(v.id))}
            onAgregado={(id) => marcarAgregado(id, reco)}
          />
        ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TarjetaComplemento({
  reco,
  origen,
  productoBaseId,
  puedeAgregar,
  clientId,
  haySesion,
  authLoading,
  pathname,
  agregado,
  onAgregado,
}: {
  reco: Recomendacion;
  origen: OrigenReco;
  productoBaseId: string | null;
  puedeAgregar: boolean;
  clientId: string | null;
  haySesion: boolean;
  authLoading: boolean;
  pathname: string;
  agregado: boolean;
  onAgregado: (productId: string) => void;
}) {
  const tallesUnicos = useMemo(
    () => Array.from(new Set(reco.variantes.map((v) => v.talle).filter((t): t is string => Boolean(t)))),
    [reco.variantes]
  );
  const [talle, setTalle] = useState<string | null>(reco.talleSugerido);
  const [estado, setEstado] = useState<"idle" | "agregando" | "error">("idle");

  const unidad =
    (talle ? reco.variantes.find((v) => v.talle === talle) : null) ??
    (tallesUnicos.length <= 1 ? reco.variantes[0] : null);
  const muestra = unidad ?? reco.variantes[0];
  const precio = Number(reco.tipo === "venta" ? muestra.precio_venta : muestra.precio_alquiler);
  const faltaTalle = tallesUnicos.length > 1 && !unidad;

  function registrarClick() {
    trackRecomendacion({ evento: "click", origen, productoBaseId, productoId: reco.variantes[0].id });
  }

  async function agregar() {
    if (!unidad || !clientId) return;
    setEstado("agregando");
    try {
      await addToCart(clientId, unidad.id, reco.tipo);
      onAgregado(unidad.id);
      setEstado("idle");
      notifyCartUpdated();
      trackRecomendacion({ evento: "agregada", origen, productoBaseId, productoId: unidad.id });
    } catch {
      setEstado("error");
    }
  }

  const botonClass =
    "flex min-h-11 w-full items-center justify-center rounded-[3px] px-3 text-center text-[11px] font-medium uppercase tracking-wider transition-colors disabled:opacity-50";

  return (
    <article className="flex w-[46%] min-w-[150px] max-w-[190px] shrink-0 snap-start flex-col gap-2 rounded-[3px] border border-arena bg-blanco p-2.5">
      <Link href={reco.href} onClick={registrarClick} className="flex flex-col gap-2">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] bg-crema">
          {reco.foto && (
            <Image
              src={reco.foto}
              alt={reco.nombre}
              fill
              sizes="190px"
              className="object-contain"
            />
          )}
        </div>
        <span className="line-clamp-2 h-8 overflow-hidden text-xs font-medium leading-4 text-negro">{reco.nombre}</span>
      </Link>

      <span className="text-xs text-negro">
        {reco.sinCosto
          ? "Sin costo · te lo prestamos"
          : `${reco.tipo === "venta" ? "Precio" : "Alquiler"} ${currencyFormatter.format(precio)}`}
      </span>

      {tallesUnicos.length === 1 && (
        <span className="text-[11px] text-taupe">Talle {tallesUnicos[0]}</span>
      )}
      {tallesUnicos.length > 1 && (
        <div className="flex flex-wrap gap-1" role="group" aria-label={`Talles de ${reco.nombre}`}>
          {tallesUnicos.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTalle(t)}
              aria-pressed={talle === t}
              className={`min-h-8 min-w-8 rounded-[3px] border px-1.5 text-[11px] transition-colors ${
                talle === t ? "border-negro bg-negro text-blanco" : "border-arena text-negro hover:border-chocolate"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-auto pt-1">
        {reco.sinCosto ? (
          <p className="text-center text-[11px] text-taupe">Pedilo al retirar</p>
        ) : !puedeAgregar ? (
          <Link
            href={reco.href}
            onClick={registrarClick}
            className={`${botonClass} border border-negro text-negro hover:border-chocolate hover:text-chocolate`}
          >
            Ver detalle
          </Link>
        ) : agregado ? (
          <span className={`${botonClass} border border-arena text-chocolate`}>
            {reco.tipo === "venta" ? "En tu carrito ✓" : "En tu look ✓"}
          </span>
        ) : !authLoading && !haySesion ? (
          <Link
            href={`/mi-cuenta/login?returnTo=${encodeURIComponent(pathname)}`}
            onClick={() => {
              if (unidad) {
                guardarPedidoPendiente({
                  productId: unidad.id,
                  talle: unidad.talle,
                  tipo: reco.tipo,
                  url: pathname,
                });
              }
            }}
            aria-disabled={faltaTalle}
            className={`${botonClass} bg-negro text-blanco hover:bg-chocolate ${faltaTalle ? "pointer-events-none opacity-50" : ""}`}
          >
            {faltaTalle ? "Elegí tu talle" : reco.tipo === "venta" ? "Agregar" : "Agregar a mi look"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={agregar}
            disabled={faltaTalle || estado === "agregando" || !clientId}
            className={`${botonClass} bg-negro text-blanco hover:bg-chocolate`}
          >
            {faltaTalle
              ? "Elegí tu talle"
              : estado === "agregando"
                ? "Agregando..."
                : estado === "error"
                  ? "Error, probá de nuevo"
                  : reco.tipo === "venta"
                    ? "Agregar"
                    : "Agregar a mi look"}
          </button>
        )}
      </div>
    </article>
  );
}
