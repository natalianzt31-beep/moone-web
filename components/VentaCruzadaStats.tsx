"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";

const DIAS = 30;

type Evento = {
  evento: "mostrada" | "click" | "agregada";
  cantidad: number;
  client_id: string | null;
  producto_id: string | null;
  created_at: string;
};

type ReservaFila = {
  id: string;
  pedido_id: string | null;
  client_id: string | null;
  product_id: string | null;
  precio_total: number;
  created_at: string;
};

type Grupo = { pedidos: number; ticket: number; articulos: number };

type Stats = {
  modulos: number;
  recomendaciones: number;
  clics: number;
  agregadas: number;
  con: Grupo;
  sin: Grupo;
};

function isoHaceDias(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

function promedio(pedidos: { total: number; articulos: number }[]): Grupo {
  if (pedidos.length === 0) return { pedidos: 0, ticket: 0, articulos: 0 };
  const total = pedidos.reduce((s, p) => s + p.total, 0);
  const articulos = pedidos.reduce((s, p) => s + p.articulos, 0);
  return { pedidos: pedidos.length, ticket: total / pedidos.length, articulos: articulos / pedidos.length };
}

async function cargarStats(): Promise<Stats> {
  const supabase = getSupabaseClient();
  const desde = isoHaceDias(DIAS);

  const [{ data: eventos, error: e1 }, { data: agregadas, error: e2 }, { data: reservas, error: e3 }] =
    await Promise.all([
      supabase
        .from("recomendacion_eventos")
        .select("evento, cantidad, client_id, producto_id, created_at")
        .gte("created_at", desde)
        .limit(20000),
      // Un complemento agregado hace un tiempo puede reservarse recién ahora.
      supabase
        .from("recomendacion_eventos")
        .select("evento, cantidad, client_id, producto_id, created_at")
        .eq("evento", "agregada")
        .not("client_id", "is", null)
        .gte("created_at", isoHaceDias(DIAS + 60))
        .limit(20000),
      supabase
        .from("reservations")
        .select("id, pedido_id, client_id, product_id, precio_total, created_at")
        .gte("created_at", desde)
        .neq("estado", "cancelado")
        .limit(20000),
    ]);
  const error = e1 ?? e2 ?? e3;
  if (error) throw error;

  const ev = (eventos ?? []) as Evento[];
  const suma = (tipo: Evento["evento"]) =>
    ev.filter((e) => e.evento === tipo).reduce((s, e) => s + (tipo === "mostrada" ? e.cantidad : 1), 0);

  const agregadoAntes = new Map<string, string>();
  for (const e of (agregadas ?? []) as Evento[]) {
    const clave = `${e.client_id}|${e.producto_id}`;
    const previo = agregadoAntes.get(clave);
    if (!previo || e.created_at < previo) agregadoAntes.set(clave, e.created_at);
  }

  const pedidos = new Map<string, { total: number; articulos: number; cruzada: boolean }>();
  for (const r of (reservas ?? []) as ReservaFila[]) {
    const clave = r.pedido_id ?? r.id;
    const pedido = pedidos.get(clave) ?? { total: 0, articulos: 0, cruzada: false };
    pedido.total += Number(r.precio_total) || 0;
    pedido.articulos += 1;
    const agregadoEn = agregadoAntes.get(`${r.client_id}|${r.product_id}`);
    if (agregadoEn && agregadoEn <= r.created_at) pedido.cruzada = true;
    pedidos.set(clave, pedido);
  }
  const lista = Array.from(pedidos.values());

  return {
    modulos: ev.filter((e) => e.evento === "mostrada").length,
    recomendaciones: suma("mostrada"),
    clics: suma("click"),
    agregadas: suma("agregada"),
    con: promedio(lista.filter((p) => p.cruzada)),
    sin: promedio(lista.filter((p) => !p.cruzada)),
  };
}

function Tile({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-[3px] border border-arena bg-blanco p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-taupe">{titulo}</p>
      <p className="mt-2 text-2xl font-normal text-negro">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-chocolate">{detalle}</p>}
    </div>
  );
}

function pct(parte: number, total: number) {
  return total > 0 ? `${((parte / total) * 100).toFixed(1)}%` : "—";
}

export function VentaCruzadaStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    cargarStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h2 className="text-lg font-normal tracking-tight text-negro">Completá tu look — venta cruzada</h2>
      <p className="mt-1 text-sm text-chocolate">Últimos {DIAS} días.</p>

      {error && <p className="mt-3 text-sm text-chocolate">Error al cargar: {error}</p>}
      {!stats && !error && <p className="mt-3 text-sm text-taupe">Cargando...</p>}

      {stats && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile
              titulo="Recomendaciones mostradas"
              valor={String(stats.recomendaciones)}
              detalle={`en ${stats.modulos} módulos`}
            />
            <Tile titulo="Clics" valor={String(stats.clics)} detalle={`${pct(stats.clics, stats.recomendaciones)} de lo mostrado`} />
            <Tile
              titulo="Agregadas al look"
              valor={String(stats.agregadas)}
              detalle={`${pct(stats.agregadas, stats.recomendaciones)} de lo mostrado`}
            />
            <Tile
              titulo="Reservas con complementos"
              valor={String(stats.con.pedidos)}
              detalle={`${pct(stats.con.pedidos, stats.con.pedidos + stats.sin.pedidos)} de las reservas`}
            />
          </div>

          <div className="mt-3 overflow-hidden rounded-[3px] border border-arena bg-blanco text-sm">
            <div className="grid grid-cols-4 gap-2 border-b border-arena px-4 py-2 text-xs uppercase tracking-wider text-taupe">
              <span />
              <span className="text-right">Reservas</span>
              <span className="text-right">Ticket promedio</span>
              <span className="text-right">Artículos</span>
            </div>
            {[
              { label: "Con venta cruzada", g: stats.con },
              { label: "Sin venta cruzada", g: stats.sin },
            ].map(({ label, g }) => (
              <div key={label} className="grid grid-cols-4 gap-2 px-4 py-2">
                <span className="text-negro">{label}</span>
                <span className="text-right text-negro">{g.pedidos}</span>
                <span className="text-right text-negro">{g.pedidos ? currencyFormatter.format(g.ticket) : "—"}</span>
                <span className="text-right text-negro">{g.pedidos ? g.articulos.toFixed(1) : "—"}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-taupe">
            Una reserva cuenta “con venta cruzada” si incluye una prenda que la clienta sumó desde una
            recomendación. Se agrupan las prendas reservadas juntas en un mismo pedido.
          </p>
        </>
      )}
    </section>
  );
}
