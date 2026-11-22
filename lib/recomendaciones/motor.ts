// Motor de recomendaciones de "Completá tu look". Funciones puras (sin
// Supabase ni React) para que se puedan probar aisladas: reciben la
// selección actual de la clienta y el catálogo, y devuelven los
// complementos ordenados. Las reglas viven en ./reglas.ts.

import { colorPrincipal } from "@/lib/colores";
import { compararTalles } from "@/lib/talles";
import type { Categoria } from "@/lib/supabase/types";
import {
  COLORES_NEUTROS,
  COMBINACIONES_IDEALES,
  COMPLEMENTOS,
  PRENDAS_PRINCIPALES,
  IMPRESCINDIBLES_SUBCATEGORIAS,
  PUNTAJES,
  TALLE_COMPARTIDO,
} from "./reglas";

/** Campos del catálogo que usa el motor. */
export type RecoProducto = {
  id: string;
  sku: string;
  nombre: string;
  categoria: Categoria;
  talle: string | null;
  color: string | null;
  precio_alquiler: number;
  precio_venta: number | null;
  slug: string;
  grupo_producto: string | null;
  estado: string;
  foto_url: string | null;
  fotos: string[] | null;
  created_at: string;
  destacado?: boolean | null;
  estilo?: string | null;
  ocasiones_uso?: string | null;
  subcategoria?: string | null;
};

export type Recomendacion = {
  /** Identifica el modelo (agrupa los talles de una misma prenda). */
  clave: string;
  categoria: Categoria;
  nombre: string;
  color: string | null;
  foto: string | null;
  href: string;
  /** Unidades disponibles del modelo, ordenadas por talle. */
  variantes: RecoProducto[];
  /** Talle preseleccionado (el de la prenda principal, si aplica). */
  talleSugerido: string | null;
  /** Accesorio que Môone presta sin costo (no se cobra ni se reserva). */
  sinCosto: boolean;
  /** Alquiler (va a la reserva) o venta (imprescindibles: se compran). */
  tipo: "alquiler" | "venta";
  puntaje: number;
};

export function nombreSinTalle(nombre: string): string {
  return nombre.replace(/\s*talle\s*\S+\s*$/i, "").trim();
}

/**
 * Identifica el modelo de una prenda, para no ofrecer dos veces lo mismo
 * en distintos talles: vestidos por slug (como sus fichas) y el resto por
 * nombre y color (hay sandalias iguales cargadas en más de un grupo).
 */
export function claveModelo(
  p: Pick<RecoProducto, "categoria" | "slug" | "nombre" | "color">
) {
  if (p.categoria === "vestido") return `vestido:${p.slug}`;
  return `${p.categoria}:${nombreSinTalle(p.nombre).toLowerCase()}:${(p.color ?? "").toLowerCase()}`;
}

export function hrefRecomendacion(p: Pick<RecoProducto, "categoria" | "slug" | "sku">) {
  return p.categoria === "vestido" ? `/vestidos/${p.slug}` : `/p/${p.sku}`;
}

/** Artículo que se alquila (tiene precio de alquiler). */
export function esAlquilable(p: Pick<RecoProducto, "precio_alquiler">) {
  return Number(p.precio_alquiler) > 0;
}

/** Accesorio que se presta sin costo: sin precio de alquiler ni de venta. */
export function esSinCosto(p: Pick<RecoProducto, "categoria" | "precio_alquiler" | "precio_venta">) {
  return p.categoria === "accesorio" && Number(p.precio_alquiler) === 0 && p.precio_venta == null;
}

function familia(color: string | null): string | null {
  return color ? colorPrincipal(color) : null;
}

const IDEALES = new Set(
  COMBINACIONES_IDEALES.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`])
);

/** Qué tan bien combinan dos colores, según reglas.ts. */
export function puntajeColor(colorA: string | null, colorB: string | null): number {
  const a = familia(colorA);
  const b = familia(colorB);
  // Sin color cargado no podemos decir que combine: no lo inventamos.
  if (!a || !b) return 0;
  if (a === b) return PUNTAJES.mismoColor;
  if (IDEALES.has(`${a}|${b}`)) return PUNTAJES.combinacionIdeal;
  if (COLORES_NEUTROS.includes(a) || COLORES_NEUTROS.includes(b)) return PUNTAJES.neutro;
  return 0;
}

function tokens(valor: string | null | undefined): Set<string> {
  if (!valor) return new Set();
  return new Set(
    valor
      .toLowerCase()
      .split(/[,;/|]+/)
      .map((t) => t.trim())
      .filter(Boolean)
  );
}

function comparten(a: string | null | undefined, b: string | null | undefined) {
  const ta = tokens(a);
  if (ta.size === 0) return false;
  for (const t of tokens(b)) if (ta.has(t)) return true;
  return false;
}

/**
 * Categorías que le faltan al look: los complementos de lo ya elegido,
 * menos las categorías que ya tiene (y si tiene vestido o mono, ninguno
 * de los dos).
 */
export function categoriasFaltantes(seleccion: Pick<RecoProducto, "categoria">[]): Categoria[] {
  const elegidas = new Set(seleccion.map((p) => p.categoria));
  const tienePrincipal = PRENDAS_PRINCIPALES.some((c) => elegidas.has(c));
  const faltantes: Categoria[] = [];
  // Primero los complementos de la prenda principal, después el resto.
  const ordenadas = [...seleccion].sort(
    (a, b) =>
      Number(PRENDAS_PRINCIPALES.includes(b.categoria)) -
      Number(PRENDAS_PRINCIPALES.includes(a.categoria))
  );
  for (const p of ordenadas) {
    for (const cat of COMPLEMENTOS[p.categoria] ?? []) {
      if (elegidas.has(cat) || faltantes.includes(cat)) continue;
      if (tienePrincipal && PRENDAS_PRINCIPALES.includes(cat)) continue;
      faltantes.push(cat);
    }
  }
  return faltantes;
}

export type OpcionesMotor = {
  /** Lo que la clienta ya eligió (la prenda que está mirando + su carrito). */
  seleccion: RecoProducto[];
  /** Catálogo candidato (ya filtrado a lo visible en la web). */
  catalogo: RecoProducto[];
  /** IDs de productos ocupados en las fechas elegidas (si las hay). */
  ocupados?: ReadonlySet<string>;
  max?: number;
};

export function recomendar({ seleccion, catalogo, ocupados, max = 6 }: OpcionesMotor): Recomendacion[] {
  if (seleccion.length === 0) return [];

  const faltantes = categoriasFaltantes(seleccion);
  if (faltantes.length === 0) return [];

  const idsElegidos = new Set(seleccion.map((p) => p.id));
  const modelosElegidos = new Set(seleccion.map(claveModelo));

  // El color y el talle del look los define la prenda principal si hay;
  // si no, todo lo elegido.
  const principales = seleccion.filter((p) => PRENDAS_PRINCIPALES.includes(p.categoria));
  const anclas = principales.length > 0 ? principales : seleccion;
  const talleAncla = principales.find((p) => p.talle)?.talle ?? null;

  // 1. Filtrar unidades realmente ofrecibles y agrupar por modelo.
  const modelos = new Map<string, RecoProducto[]>();
  for (const p of catalogo) {
    if (!faltantes.includes(p.categoria)) continue;
    if (p.estado !== "disponible") continue;
    if (!esAlquilable(p) && !esSinCosto(p)) continue;
    if (idsElegidos.has(p.id)) continue;
    const clave = claveModelo(p);
    if (modelosElegidos.has(clave)) continue;
    if (ocupados?.has(p.id)) continue;
    const lista = modelos.get(clave);
    if (lista) lista.push(p);
    else modelos.set(clave, [p]);
  }

  // 2. Puntuar cada modelo.
  const porCategoria = new Map<Categoria, Recomendacion[]>();
  for (const [clave, unidades] of modelos) {
    const variantes = [...unidades].sort((a, b) => compararTalles(a.talle, b.talle));
    const muestra = variantes[0];

    const color = Math.max(...anclas.map((a) => puntajeColor(a.color, muestra.color)));
    if (color < PUNTAJES.minimoColor) continue;

    let puntaje = color;
    if (anclas.some((a) => comparten(a.estilo, muestra.estilo))) puntaje += PUNTAJES.estiloCompartido;
    if (anclas.some((a) => comparten(a.ocasiones_uso, muestra.ocasiones_uso))) {
      puntaje += PUNTAJES.ocasionCompartida;
    }
    if (variantes.some((v) => v.destacado)) puntaje += PUNTAJES.destacado;

    let talleSugerido: string | null = null;
    if (TALLE_COMPARTIDO.includes(muestra.categoria) && talleAncla) {
      const match = variantes.find(
        (v) => v.talle && v.talle.toUpperCase() === talleAncla.toUpperCase()
      );
      if (match) {
        talleSugerido = match.talle;
        puntaje += PUNTAJES.talleCompatible;
      }
    }
    // Un solo talle disponible: no hay nada que elegir.
    const tallesUnicos = new Set(variantes.map((v) => v.talle));
    if (tallesUnicos.size === 1) talleSugerido = muestra.talle;

    const foto =
      variantes.map((v) => v.fotos?.[0] ?? v.foto_url).find((f): f is string => Boolean(f)) ?? null;
    // Sin foto no se muestra: cada recomendación debe llevar fotografía.
    if (!foto) continue;

    const reco: Recomendacion = {
      clave,
      categoria: muestra.categoria,
      nombre: nombreSinTalle(muestra.nombre),
      color: muestra.color,
      foto,
      href: hrefRecomendacion(muestra),
      variantes,
      talleSugerido,
      sinCosto: esSinCosto(muestra),
      tipo: "alquiler",
      puntaje,
    };
    const lista = porCategoria.get(muestra.categoria);
    if (lista) lista.push(reco);
    else porCategoria.set(muestra.categoria, [reco]);
  }

  // Desempate estable: destacados, más nuevos, y por último la clave.
  const masNuevo = (r: Recomendacion) =>
    r.variantes.reduce((m, v) => (v.created_at > m ? v.created_at : m), "");
  for (const lista of porCategoria.values()) {
    lista.sort(
      (a, b) =>
        b.puntaje - a.puntaje ||
        masNuevo(b).localeCompare(masNuevo(a)) ||
        a.clave.localeCompare(b.clave)
    );
  }

  // 3. Repartir en ronda entre las categorías que faltan, en orden de
  //    prioridad, para que el look se complete con piezas distintas.
  const resultado: Recomendacion[] = [];
  let ronda = 0;
  while (resultado.length < max) {
    let agrego = false;
    for (const cat of faltantes) {
      const reco = porCategoria.get(cat)?.[ronda];
      if (reco && resultado.length < max) {
        resultado.push(reco);
        agrego = true;
      }
    }
    if (!agrego) break;
    ronda++;
  }
  return resultado;
}

/** Hay superposición entre dos rangos de fechas ISO (inclusive). */
export function rangosSeSuperponen(
  a: { desde: string; hasta: string },
  b: { desde: string; hasta: string }
) {
  return a.desde <= b.hasta && b.desde <= a.hasta;
}

/**
 * Imprescindibles de venta (medias, soutien adhesivo…): se ofrecen siempre,
 * salvo los modelos que la clienta ya tiene en el carrito.
 */
export function imprescindibles(
  catalogo: RecoProducto[],
  excluirIds: ReadonlySet<string> = new Set()
): Recomendacion[] {
  const modelos = new Map<string, RecoProducto[]>();
  const modelosExcluidos = new Set<string>();
  for (const p of catalogo) {
    if (!p.subcategoria || !IMPRESCINDIBLES_SUBCATEGORIAS.includes(p.subcategoria)) continue;
    const clave = claveModelo(p);
    if (excluirIds.has(p.id)) modelosExcluidos.add(clave);
    if (p.estado !== "disponible" || !(Number(p.precio_venta) > 0)) continue;
    const lista = modelos.get(clave);
    if (lista) lista.push(p);
    else modelos.set(clave, [p]);
  }
  const resultado: Recomendacion[] = [];
  for (const [clave, unidades] of modelos) {
    if (modelosExcluidos.has(clave)) continue;
    const variantes = [...unidades].sort((a, b) => compararTalles(a.talle, b.talle));
    const muestra = variantes[0];
    const foto =
      variantes.map((v) => v.fotos?.[0] ?? v.foto_url).find((f): f is string => Boolean(f)) ?? null;
    if (!foto) continue;
    resultado.push({
      clave,
      categoria: muestra.categoria,
      nombre: nombreSinTalle(muestra.nombre),
      color: muestra.color,
      foto,
      href: hrefRecomendacion(muestra),
      variantes,
      talleSugerido: new Set(variantes.map((v) => v.talle)).size === 1 ? muestra.talle : null,
      sinCosto: false,
      tipo: "venta",
      puntaje: 0,
    });
  }
  // Mismo orden que reglas.ts (medias primero), y dentro, por nombre.
  return resultado.sort(
    (a, b) =>
      IMPRESCINDIBLES_SUBCATEGORIAS.indexOf(a.variantes[0].subcategoria ?? "") -
        IMPRESCINDIBLES_SUBCATEGORIAS.indexOf(b.variantes[0].subcategoria ?? "") ||
      a.nombre.localeCompare(b.nombre)
  );
}
