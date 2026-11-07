"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  fetchArreglosBandeja,
  paActualizar,
  paCancelar,
  paCrear,
  paMarcarPronto,
  paReabrir,
} from "@/lib/supabase/arreglos";
import { addDays, toISODate } from "@/lib/disponibilidad";
import type { ArregloBandeja } from "@/lib/supabase/types";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const buttonClass =
  "flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60";

const buttonOutlineClass =
  "flex min-h-11 items-center justify-center rounded-[3px] border border-arena px-4 text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60";

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="text-sm text-chocolate">{error}</p>;
}

function diasClase(dias: number): string {
  if (dias < 0) return "text-chocolate font-semibold";
  if (dias <= 5) return "text-chocolate";
  return "text-taupe";
}

function diasTexto(dias: number): string {
  if (dias < 0) return `Vencido (${Math.abs(dias)} día(s))`;
  if (dias === 0) return "Hoy";
  return `${dias} día(s)`;
}

/* ---------------- Cobros: nuevo arreglo ---------------- */

type ProductoBusqueda = { id: string; nombre: string; talle: string | null; foto_url: string | null; estado: string };

function NuevoArregloForm({
  pendientesSkus,
  skuInicial,
  reservationIdInicial,
  fechaInicial,
  onCreated,
}: {
  pendientesSkus: Set<string>;
  skuInicial?: string;
  reservationIdInicial?: string;
  fechaInicial?: string;
  onCreated: () => void;
}) {
  const [sku, setSku] = useState(skuInicial ?? "");
  const [producto, setProducto] = useState<ProductoBusqueda | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [detalle, setDetalle] = useState("");
  const [fechaRetiro, setFechaRetiro] = useState(fechaInicial ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const skuTrim = sku.trim();
    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (cancelled) return;
      if (!skuTrim) {
        setProducto(null);
        setBuscando(false);
        return;
      }
      setBuscando(true);
      const { data } = await getSupabaseClient()
        .from("products")
        .select("id, nombre, talle, foto_url, estado")
        .ilike("sku", skuTrim)
        .maybeSingle();
      if (!cancelled) {
        setProducto(data ?? null);
        setBuscando(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [sku]);

  const yaTienePendiente = pendientesSkus.has(sku.trim().toUpperCase());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await paCrear({
        sku: sku.trim(),
        detalle,
        fechaRetiro: fechaRetiro || null,
        reservationId: reservationIdInicial ?? null,
      });
      setSku("");
      setDetalle("");
      setFechaRetiro("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-negro">
        SKU
        <input
          required
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className={inputClass}
          placeholder="Ej: VES-00412"
        />
      </label>

      {buscando && <p className="text-xs text-taupe">Buscando...</p>}
      {!buscando && sku.trim() && !producto && <p className="text-xs text-chocolate">No existe ese SKU.</p>}
      {producto && (
        <div className="flex items-center gap-3 rounded-[3px] border border-arena bg-blanco px-3 py-2">
          {producto.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={producto.foto_url} alt={producto.nombre} className="h-14 w-14 rounded-[3px] object-cover" />
          )}
          <div>
            <p className="text-sm text-negro">{producto.nombre}</p>
            <p className="text-xs text-taupe">Talle {producto.talle ?? "—"}</p>
          </div>
        </div>
      )}
      {yaTienePendiente && (
        <p className="text-xs text-chocolate">Ese SKU ya tiene otro arreglo pendiente.</p>
      )}
      {reservationIdInicial && <p className="text-xs text-taupe">Vinculado a la reserva {reservationIdInicial}</p>}

      <label className="flex flex-col gap-1 text-sm text-negro">
        Detalle del arreglo
        <textarea
          required
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          rows={3}
          className="rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-negro">
        Fecha de retiro de la clienta {reservationIdInicial && "(opcional, toma la de la reserva)"}
        <input
          type="date"
          required={!reservationIdInicial}
          value={fechaRetiro}
          onChange={(e) => setFechaRetiro(e.target.value)}
          className={inputClass}
        />
      </label>

      <ErrorBox error={error} />
      <button type="submit" disabled={saving || !producto} className={buttonClass}>
        {saving ? "Guardando..." : "Cargar arreglo"}
      </button>
    </form>
  );
}

/* ---------------- Cobros: editar / reabrir / cancelar ---------------- */

function EditarArregloForm({ arreglo, onDone }: { arreglo: ArregloBandeja; onDone: () => void }) {
  const [detalle, setDetalle] = useState(arreglo.detalle);
  const [fecha, setFecha] = useState(arreglo.fecha_retiro_clienta);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await paActualizar(arreglo.id, detalle, fecha);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        rows={2}
        className="rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none"
      />
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
      <ErrorBox error={error} />
      <button type="submit" disabled={saving} className={buttonClass}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}

function PendienteCard({ arreglo, onChange }: { arreglo: ArregloBandeja; onChange: () => void }) {
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelar() {
    setError(null);
    try {
      await paCancelar(arreglo.id);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-[3px] border border-arena bg-blanco px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-negro">
            {arreglo.sku} · {arreglo.nombre} {arreglo.talle ? `· talle ${arreglo.talle}` : ""}
          </p>
          <p className="text-xs text-taupe">{arreglo.detalle}</p>
        </div>
        <div className={`text-right text-xs ${diasClase(arreglo.dias_restantes)}`}>
          <p>{arreglo.fecha_retiro_clienta}</p>
          <p>{diasTexto(arreglo.dias_restantes)}</p>
        </div>
      </div>
      <ErrorBox error={error} />
      {editando ? (
        <EditarArregloForm
          arreglo={arreglo}
          onDone={() => {
            setEditando(false);
            onChange();
          }}
        />
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditando(true)} className={buttonOutlineClass}>
            Editar
          </button>
          <button type="button" onClick={cancelar} className={buttonOutlineClass}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function CobrosArreglosSection({
  arreglos,
  loading,
  onChange,
}: {
  arreglos: ArregloBandeja[];
  loading: boolean;
  onChange: () => void;
}) {
  const searchParams = useSearchParams();
  const pendientes = arreglos.filter((a) => a.estado === "pendiente");
  const pendientesSkus = new Set(pendientes.map((a) => a.sku.toUpperCase()));

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h2 className="text-lg font-normal tracking-tight text-negro">Nuevo arreglo</h2>
        <div className="mt-4 max-w-md">
          <NuevoArregloForm
            pendientesSkus={pendientesSkus}
            skuInicial={searchParams.get("sku") ?? undefined}
            reservationIdInicial={searchParams.get("reservationId") ?? undefined}
            fechaInicial={searchParams.get("fecha") ?? undefined}
            onCreated={onChange}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-normal tracking-tight text-negro">Pendientes</h2>
        {loading ? (
          <p className="mt-4 text-sm text-taupe">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p className="mt-4 text-sm text-taupe">No hay arreglos pendientes.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {pendientes.map((a) => (
              <PendienteCard key={a.id} arreglo={a} onChange={onChange} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Modista: bandeja ---------------- */

function MarcarProntoForm({ arreglo, onDone }: { arreglo: ArregloBandeja; onDone: () => void }) {
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSaving(true);
    setError(null);
    try {
      await paMarcarPronto(arreglo.id, nota || undefined);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        placeholder="Nota (opcional)"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        className={inputClass}
      />
      <ErrorBox error={error} />
      <button type="button" onClick={handleClick} disabled={saving} className={buttonClass}>
        {saving ? "Guardando..." : "Marcar pronto"}
      </button>
    </div>
  );
}

function BandejaCard({ arreglo, onChange }: { arreglo: ArregloBandeja; onChange: () => void }) {
  const [error, setError] = useState<string | null>(null);

  async function reabrir() {
    setError(null);
    try {
      await paReabrir(arreglo.id);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[3px] border border-arena bg-blanco p-4">
      <div className="flex items-start gap-3">
        {arreglo.foto_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={arreglo.foto_url} alt={arreglo.nombre} className="h-16 w-16 rounded-[3px] object-cover" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-negro">
            {arreglo.sku} · {arreglo.nombre} {arreglo.talle ? `· talle ${arreglo.talle}` : ""}
          </p>
          <p className="mt-1 text-sm text-chocolate">{arreglo.detalle}</p>
          <p className={`mt-1 text-xs ${diasClase(arreglo.dias_restantes)}`}>
            Retiro {arreglo.fecha_retiro_clienta} · {diasTexto(arreglo.dias_restantes)}
          </p>
        </div>
      </div>
      <ErrorBox error={error} />
      {arreglo.estado === "pendiente" ? (
        <MarcarProntoForm arreglo={arreglo} onDone={onChange} />
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs text-taupe">
            Pronto{arreglo.nota_modista ? ` — ${arreglo.nota_modista}` : ""}
          </p>
          <button type="button" onClick={reabrir} className={buttonOutlineClass}>
            Reabrir
          </button>
        </div>
      )}
    </div>
  );
}

function ModistaBandejaSection({
  arreglos,
  loading,
  onChange,
}: {
  arreglos: ArregloBandeja[];
  loading: boolean;
  onChange: () => void;
}) {
  const [tab, setTab] = useState<"pendientes" | "prontos">("pendientes");
  const haceUnMes = addDays(toISODate(new Date()), -30);

  const pendientes = arreglos.filter((a) => a.estado === "pendiente");
  const prontos = arreglos
    .filter((a) => a.estado === "pronto" && (a.pronto_at ?? "") >= haceUnMes)
    .sort((a, b) => (b.pronto_at ?? "").localeCompare(a.pronto_at ?? ""));

  const lista = tab === "pendientes" ? pendientes : prontos;

  return (
    <section>
      <h2 className="text-lg font-normal tracking-tight text-negro">Bandeja de arreglos</h2>
      <nav className="mt-4 flex gap-2 border-b border-arena pb-2">
        <button
          type="button"
          onClick={() => setTab("pendientes")}
          className={`flex min-h-11 items-center rounded-[3px] px-3 text-xs font-medium uppercase tracking-wider transition-colors ${
            tab === "pendientes" ? "bg-negro text-blanco" : "text-taupe hover:text-chocolate"
          }`}
        >
          Pendientes ({pendientes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("prontos")}
          className={`flex min-h-11 items-center rounded-[3px] px-3 text-xs font-medium uppercase tracking-wider transition-colors ${
            tab === "prontos" ? "bg-negro text-blanco" : "text-taupe hover:text-chocolate"
          }`}
        >
          Prontos (30 días)
        </button>
      </nav>

      {loading ? (
        <p className="mt-4 text-sm text-taupe">Cargando...</p>
      ) : lista.length === 0 ? (
        <p className="mt-4 text-sm text-taupe">No hay arreglos en esta lista.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {lista.map((a) => (
            <BandejaCard key={a.id} arreglo={a} onChange={onChange} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- Page ---------------- */

function ArreglosContent() {
  const { staffRol } = useAuth();
  const [arreglos, setArreglos] = useState<ArregloBandeja[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setArreglos(await fetchArreglosBandeja());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const verCobros = staffRol === "caja" || staffRol === "admin" || staffRol === null;
  const verModista = staffRol === "modista" || staffRol === "admin" || staffRol === null;

  return (
    <div className="flex flex-col gap-12">
      {verCobros && <CobrosArreglosSection arreglos={arreglos} loading={loading} onChange={load} />}
      {verModista && <ModistaBandejaSection arreglos={arreglos} loading={loading} onChange={load} />}
    </div>
  );
}

export default function AdminArreglosPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">Arreglos</h1>
            <p className="mt-1 text-sm text-chocolate">
              Arreglos de vestidos de alquiler: cobros los carga, la modista los marca pronto.
            </p>
            <div className="mt-8">
              <ArreglosContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
