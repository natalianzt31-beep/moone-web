"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";

const HORAS_ABANDONO = 3;

function isoHoy(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function isoHaceDias(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

function isoHaceHoras(horas: number): string {
  return new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();
}

async function getAccessTokenOrThrow(): Promise<string> {
  const { data } = await getSupabaseClient().auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
  return accessToken;
}

type Rango = { hoy: number; ultimos7: number; ultimos30: number; total: number };

async function resolverRango(
  total: PromiseLike<{ count: number | null }>,
  hoy: PromiseLike<{ count: number | null }>,
  ultimos7: PromiseLike<{ count: number | null }>,
  ultimos30: PromiseLike<{ count: number | null }>
): Promise<Rango> {
  const resultados = await Promise.all([total, hoy, ultimos7, ultimos30]);
  return {
    total: resultados[0].count ?? 0,
    hoy: resultados[1].count ?? 0,
    ultimos7: resultados[2].count ?? 0,
    ultimos30: resultados[3].count ?? 0,
  };
}

async function cargarRangoVisitas(): Promise<Rango> {
  const client = getSupabaseClient();
  const base = () => client.from("page_views").select("id", { count: "exact", head: true });
  return resolverRango(
    base(),
    base().gte("created_at", isoHoy()),
    base().gte("created_at", isoHaceDias(7)),
    base().gte("created_at", isoHaceDias(30))
  );
}

async function cargarRangoCuentasNuevas(): Promise<Rango> {
  const client = getSupabaseClient();
  const base = () =>
    client.from("clients").select("id", { count: "exact", head: true }).not("auth_user_id", "is", null);
  return resolverRango(
    base(),
    base().gte("created_at", isoHoy()),
    base().gte("created_at", isoHaceDias(7)),
    base().gte("created_at", isoHaceDias(30))
  );
}

function StatTile({ titulo, rango }: { titulo: string; rango: Rango }) {
  return (
    <div className="rounded-[3px] border border-arena bg-blanco p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-taupe">{titulo}</p>
      <p className="mt-2 text-3xl font-normal text-negro">{rango.total}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-chocolate">
        <span>Hoy: {rango.hoy}</span>
        <span>7 días: {rango.ultimos7}</span>
        <span>30 días: {rango.ultimos30}</span>
      </div>
    </div>
  );
}

type CartItemAbandonado = {
  id: string;
  tipo: "alquiler" | "venta";
  created_at: string;
  recordatorio_enviado_at: string | null;
  products: { nombre: string; precio_alquiler: number; precio_venta: number | null } | null;
  carts: { clients: { nombre: string; celular: string | null; email: string | null } | null } | null;
};

function tiempoTranscurrido(fechaISO: string): string {
  const horas = Math.floor((Date.now() - new Date(fechaISO).getTime()) / (60 * 60 * 1000));
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
}

function CarritosAbandonados() {
  const [items, setItems] = useState<CartItemAbandonado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await getSupabaseClient()
      .from("cart_items")
      .select(
        "id, tipo, created_at, recordatorio_enviado_at, products(nombre, precio_alquiler, precio_venta), carts(clients(nombre, celular, email))"
      )
      .lt("created_at", isoHaceHoras(HORAS_ABANDONO))
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    setItems((data ?? []) as unknown as CartItemAbandonado[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleEnviarRecordatorios() {
    setEnviando(true);
    setResultado(null);
    try {
      const accessToken = await getAccessTokenOrThrow();
      const res = await fetch("/api/admin/enviar-recordatorios-carritos", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo enviar.");
      if (!json.configurado) {
        setResultado("Resend todavía no está configurada — no se mandó ningún mail.");
      } else {
        setResultado(`Se avisó a ${json.clientasNotificadas} clienta(s).`);
        load();
      }
    } catch (err) {
      setResultado(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-normal tracking-tight text-negro">Carritos abandonados</h2>
          <p className="mt-1 text-sm text-chocolate">
            Prendas agregadas al carrito hace más de {HORAS_ABANDONO} horas y todavía no
            reservadas ni compradas.
          </p>
        </div>
        <button
          type="button"
          onClick={handleEnviarRecordatorios}
          disabled={enviando || items.length === 0}
          className="whitespace-nowrap rounded-[3px] bg-negro px-4 py-2 text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar recordatorios por mail"}
        </button>
      </div>

      {resultado && <p className="mt-2 text-sm text-chocolate">{resultado}</p>}
      {error && <p className="mt-3 text-sm text-chocolate">Error al cargar: {error}</p>}

      {loading ? (
        <p className="mt-3 text-sm text-taupe">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-taupe">No hay carritos abandonados por ahora.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {items.map((item) => {
            const cliente = item.carts?.clients;
            const precio =
              item.tipo === "venta" ? item.products?.precio_venta : item.products?.precio_alquiler;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-[3px] border border-arena bg-blanco p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-negro">
                    {item.products?.nombre ?? "Prenda"}
                    {precio != null && ` · ${currencyFormatter.format(precio)}`}
                  </p>
                  <p className="text-sm text-taupe">
                    {cliente?.nombre ?? "Clienta"} · {cliente?.celular ?? cliente?.email ?? "sin contacto"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-taupe">
                    {tiempoTranscurrido(item.created_at)}
                  </span>
                  {item.recordatorio_enviado_at && (
                    <p className="mt-1 text-xs text-chocolate">Ya se le avisó</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AnaliticaContent() {
  const [visitas, setVisitas] = useState<Rango | null>(null);
  const [nuevosUsuarios, setNuevosUsuarios] = useState<Rango | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [v, u] = await Promise.all([cargarRangoVisitas(), cargarRangoCuentasNuevas()]);
        if (!cancelled) {
          setVisitas(v);
          setNuevosUsuarios(u);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="mt-8 text-sm text-chocolate">Error al cargar: {error}</p>;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visitas ? (
          <StatTile titulo="Visitas al sitio" rango={visitas} />
        ) : (
          <div className="rounded-[3px] border border-arena bg-blanco p-5 text-sm text-taupe">
            Cargando...
          </div>
        )}
        {nuevosUsuarios ? (
          <StatTile titulo="Cuentas nuevas" rango={nuevosUsuarios} />
        ) : (
          <div className="rounded-[3px] border border-arena bg-blanco p-5 text-sm text-taupe">
            Cargando...
          </div>
        )}
      </div>

      <CarritosAbandonados />
    </div>
  );
}

export default function AdminAnaliticaPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Analítica
            </h1>
            <p className="mt-1 text-sm text-chocolate">
              Visitas, cuentas nuevas y carritos abandonados.
            </p>
            <div className="mt-8">
              <AnaliticaContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
