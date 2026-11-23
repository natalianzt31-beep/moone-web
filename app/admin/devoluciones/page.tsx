"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { ROLES_ADMIN_CAJA } from "@/lib/adminAccess";
import { getSupabaseClient } from "@/lib/supabase/client";
import { addDays, toISODate } from "@/lib/disponibilidad";

/**
 * Devoluciones del día: todo lo que se llevaron desde el lunes pasado
 * (fecha de retiro entre el lunes de la semana anterior y hoy) y que todavía
 * no volvió. Se separa en lo que vence hoy, lo atrasado y lo que vuelve más
 * adelante. Cuenta cualquier estado "afuera" (no solo "retirado"), porque
 * las reservas cargadas desde el admin no siempre se marcan como retiradas.
 */

type Fila = {
  id: string;
  client_id: string | null;
  estado: string;
  fecha_retiro: string;
  fecha_devolucion: string;
  products: {
    sku: string;
    nombre: string;
    talle: string | null;
    color: string | null;
    fotos: string[] | null;
    foto_url: string | null;
  } | null;
  clients: { nombre: string; celular: string | null } | null;
};

/** Lunes de la semana pasada (si hoy es lunes, el de hace 7 días). */
function lunesPasado(hoyIso: string): string {
  const dia = new Date(`${hoyIso}T00:00:00`).getDay(); // 0 = domingo
  const desdeLunes = (dia + 6) % 7;
  return addDays(hoyIso, -(desdeLunes === 0 ? 7 : desdeLunes + 7));
}

function formatFecha(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Tarjeta({
  fila,
  etiqueta,
  etiquetaClass,
  ocupado,
  onDevolvio,
}: {
  fila: Fila;
  etiqueta: string;
  etiquetaClass: string;
  ocupado: boolean;
  onDevolvio: () => void;
}) {
  const p = fila.products;
  const foto = p?.fotos?.[0] ?? p?.foto_url ?? null;
  return (
    <div className="flex items-center gap-3 px-5 py-3 text-sm">
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[3px] border border-arena bg-crema">
        {foto && <Image src={foto} alt={p?.nombre ?? ""} fill sizes="48px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-negro">
          {p?.nombre ?? "Prenda"}
          {p?.talle ? ` · ${p.talle}` : ""}
        </p>
        <p className="truncate text-xs text-taupe">
          {p?.sku} · {fila.clients?.nombre ?? "Clienta"}
          {fila.clients?.celular ? ` · ${fila.clients.celular}` : ""}
        </p>
        <p className="text-xs text-taupe">
          Se llevó {formatFecha(fila.fecha_retiro)} · devuelve {formatFecha(fila.fecha_devolucion)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`text-xs uppercase tracking-wider ${etiquetaClass}`}>{etiqueta}</span>
        <button
          type="button"
          onClick={onDevolvio}
          disabled={ocupado}
          className="min-h-9 rounded-[3px] border border-negro px-3 text-xs uppercase tracking-wider text-negro hover:border-chocolate hover:text-chocolate disabled:opacity-50"
        >
          {ocupado ? "..." : "Devolvió"}
        </button>
      </div>
    </div>
  );
}

function Seccion({ titulo, filas, children }: { titulo: string; filas: number; children: React.ReactNode }) {
  return (
    <section className="rounded-[3px] border border-arena bg-blanco">
      <h2 className="border-b border-arena px-5 py-3 text-sm font-medium uppercase tracking-wider text-negro">
        {titulo} <span className="text-taupe">({filas})</span>
      </h2>
      <div className="divide-y divide-arena">{children}</div>
    </section>
  );
}

function DevolucionesContent() {
  const hoy = toISODate(new Date());
  const desde = lunesPasado(hoy);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error: err } = await getSupabaseClient()
      .from("reservations")
      .select(
        "id, client_id, estado, fecha_retiro, fecha_devolucion, products(sku, nombre, talle, color, fotos, foto_url), clients(nombre, celular)"
      )
      .gte("fecha_retiro", desde)
      .lte("fecha_retiro", hoy)
      .not("estado", "in", "(devuelto,en_limpieza,cancelado,vencido)")
      .order("fecha_devolucion")
      .order("fecha_retiro");

    if (err) setError(err.message);
    setFilas((data as unknown as Fila[]) ?? []);
    setCargando(false);
  }, [desde, hoy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde Supabase
    void cargar();
  }, [cargar]);

  async function marcarDevuelta(fila: Fila) {
    setOcupadoId(fila.id);
    setError(null);
    const { error: err } = await getSupabaseClient()
      .from("reservations")
      .update({ estado: "en_limpieza" })
      .eq("id", fila.id);
    if (err) {
      setError(err.message);
    } else {
      setFilas((prev) => prev.filter((f) => f.id !== fila.id));
    }
    setOcupadoId(null);
  }

  if (cargando) return <p className="text-sm text-taupe">Cargando...</p>;

  const hoyFilas = filas.filter((f) => f.fecha_devolucion === hoy);
  const atrasadas = filas.filter((f) => f.fecha_devolucion < hoy);
  const masAdelante = filas.filter((f) => f.fecha_devolucion > hoy);

  const tarjeta = (f: Fila, etiqueta: string, etiquetaClass: string) => (
    <Tarjeta
      key={f.id}
      fila={f}
      etiqueta={etiqueta}
      etiquetaClass={etiquetaClass}
      ocupado={ocupadoId === f.id}
      onDevolvio={() => marcarDevuelta(f)}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-chocolate">
        Prendas que se llevaron desde el lunes {formatFecha(desde)} y todavía no volvieron.
        Al tocar <strong>Devolvió</strong> pasan a limpieza.
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}

      <Seccion titulo="Devuelven hoy" filas={hoyFilas.length}>
        {hoyFilas.length === 0 && <p className="px-5 py-6 text-sm text-taupe">Nadie devuelve hoy.</p>}
        {hoyFilas.map((f) => tarjeta(f, "Hoy", "text-chocolate"))}
      </Seccion>

      <Seccion titulo="Atrasadas" filas={atrasadas.length}>
        {atrasadas.length === 0 && <p className="px-5 py-6 text-sm text-taupe">No hay devoluciones atrasadas.</p>}
        {atrasadas.map((f) => tarjeta(f, `Debía ${formatFecha(f.fecha_devolucion)}`, "text-red-700"))}
      </Seccion>

      <Seccion titulo="Afuera — devuelven más adelante" filas={masAdelante.length}>
        {masAdelante.length === 0 && <p className="px-5 py-6 text-sm text-taupe">Nada más afuera.</p>}
        {masAdelante.map((f) => tarjeta(f, formatFecha(f.fecha_devolucion), "text-taupe"))}
      </Seccion>
    </div>
  );
}

export default function AdminDevolucionesPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff roles={ROLES_ADMIN_CAJA}>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Devoluciones de hoy
            </h1>
            <div className="mt-6">
              <DevolucionesContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
