"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  fetchPedidosMedida,
  fetchPedidosMedidaCobros,
  pmCancelar,
  pmCrear,
  pmEntregar,
  pmFacturar,
  pmTerminar,
} from "@/lib/supabase/pedidosMedida";
import { currencyFormatter } from "@/lib/site-config";
import { toISODate } from "@/lib/disponibilidad";
import type { PedidoMedida, PedidoMedidaCobro } from "@/lib/supabase/types";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const buttonClass =
  "flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-4 text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60";

const buttonOutlineClass =
  "flex min-h-11 items-center justify-center rounded-[3px] border border-arena px-4 text-xs font-medium uppercase tracking-wider text-chocolate transition-colors hover:border-chocolate disabled:opacity-60";

const MEDIOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
];

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="text-sm text-chocolate">{error}</p>;
}

/* ---------------- Modista: cargar pedido ---------------- */

function CrearPedidoForm({ onCreated }: { onCreated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [ci, setCi] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [seniaPorcentaje, setSeniaPorcentaje] = useState("50");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await pmCrear({
        nombre,
        ci,
        email,
        celular,
        monto: Number(monto),
        descripcion: descripcion || undefined,
        seniaPorcentaje: Number(seniaPorcentaje) || 50,
      });
      setNombre("");
      setCi("");
      setEmail("");
      setCelular("");
      setMonto("");
      setDescripcion("");
      setSeniaPorcentaje("50");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-negro">
          Nombre
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          CI
          <input required value={ci} onChange={(e) => setCi(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Mail
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Celular
          <input required value={celular} onChange={(e) => setCelular(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Monto presupuestado
          <input
            required
            type="number"
            min="1"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          % de seña
          <input
            type="number"
            min="0"
            max="100"
            value={seniaPorcentaje}
            onChange={(e) => setSeniaPorcentaje(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm text-negro">
        Descripción del vestido (opcional)
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className="rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none"
        />
      </label>
      <ErrorBox error={error} />
      <button type="submit" disabled={saving} className={buttonClass}>
        {saving ? "Guardando..." : "Cargar pedido"}
      </button>
    </form>
  );
}

/* ---------------- Modista: terminar pedido ---------------- */

function TerminarPedidoButton({ pedido, onDone }: { pedido: PedidoMedida; onDone: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(toISODate(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className={buttonOutlineClass}>
        Terminado
      </button>
    );
  }

  async function confirmar() {
    setSaving(true);
    setError(null);
    try {
      await pmTerminar(pedido.id, fecha);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-xs text-negro">
        Fecha de retiro
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
      </label>
      <ErrorBox error={error} />
      <div className="flex gap-2">
        <button type="button" onClick={confirmar} disabled={saving} className={buttonClass}>
          {saving ? "Guardando..." : "Confirmar"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className={buttonOutlineClass}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ModistaSection() {
  const [pedidos, setPedidos] = useState<PedidoMedida[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setPedidos(await fetchPedidosMedida());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const enConfeccion = pedidos.filter((p) => p.estado === "en_confeccion");
  const pendientesSenia = pedidos.filter((p) => p.estado === "pendiente_senia");
  const terminados = pedidos.filter((p) => ["terminado", "pagado", "entregado"].includes(p.estado));

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h2 className="text-lg font-normal tracking-tight text-negro">Cargar nuevo pedido</h2>
        <div className="mt-4">
          <CrearPedidoForm onCreated={load} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-normal tracking-tight text-negro">En confección</h2>
        {loading ? (
          <p className="mt-4 text-sm text-taupe">Cargando...</p>
        ) : enConfeccion.length === 0 ? (
          <p className="mt-4 text-sm text-taupe">No hay pedidos en confección.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {enConfeccion.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[3px] border border-arena bg-blanco px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-negro">
                    #{p.numero} · {p.clients?.nombre ?? "—"}
                  </p>
                  <p className="text-xs text-taupe">{p.descripcion || "Sin descripción"}</p>
                  <p className="text-xs text-chocolate">Presupuesto: {currencyFormatter.format(p.monto_presupuestado)}</p>
                </div>
                <TerminarPedidoButton pedido={p} onDone={load} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">Pendientes de seña</h3>
          <div className="mt-3 flex flex-col gap-2">
            {pendientesSenia.length === 0 && <p className="text-sm text-taupe">—</p>}
            {pendientesSenia.map((p) => (
              <p key={p.id} className="text-sm text-negro">
                #{p.numero} · {p.clients?.nombre ?? "—"}
              </p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">Terminados</h3>
          <div className="mt-3 flex flex-col gap-2">
            {terminados.length === 0 && <p className="text-sm text-taupe">—</p>}
            {terminados.map((p) => (
              <p key={p.id} className="text-sm text-negro">
                #{p.numero} · {p.clients?.nombre ?? "—"} · {p.estado}
                {p.fecha_retiro ? ` · retiro ${p.fecha_retiro}` : ""}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Cobros ---------------- */

function RegistrarPagoForm({
  pedido,
  sugerido,
  onDone,
}: {
  pedido: PedidoMedidaCobro;
  sugerido: number;
  onDone: () => void;
}) {
  const [monto, setMonto] = useState(String(sugerido));
  const [medio, setMedio] = useState("efectivo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const { data } = await getSupabaseClient().auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/admin/pedidos-medida/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pedidoId: pedido.id, monto: Number(monto), medio }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "No se pudo registrar el pago.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-negro">
        Monto
        <input
          required
          type="number"
          min="1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className={`${inputClass} w-32`}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-negro">
        Medio
        <select value={medio} onChange={(e) => setMedio(e.target.value)} className={inputClass}>
          {MEDIOS_PAGO.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={saving} className={buttonClass}>
        {saving ? "Guardando..." : "Registrar pago"}
      </button>
      <ErrorBox error={error} />
    </form>
  );
}

function FacturarForm({ pedido, onDone }: { pedido: PedidoMedidaCobro; onDone: () => void }) {
  const [numero, setNumero] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await pmFacturar(pedido.id, numero);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-negro">
        Número de factura
        <input required value={numero} onChange={(e) => setNumero(e.target.value)} className={inputClass} />
      </label>
      <button type="submit" disabled={saving} className={buttonClass}>
        {saving ? "Guardando..." : "Facturar"}
      </button>
      <ErrorBox error={error} />
    </form>
  );
}

function EntregarButton({ pedido, onDone }: { pedido: PedidoMedidaCobro; onDone: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSaving(true);
    setError(null);
    try {
      await pmEntregar(pedido.id);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={handleClick} disabled={saving} className={buttonClass}>
        {saving ? "Guardando..." : "Entregar"}
      </button>
      <ErrorBox error={error} />
    </div>
  );
}

function CancelarPedidoButton({ pedido, onDone }: { pedido: PedidoMedidaCobro; onDone: () => void }) {
  const [motivo, setMotivo] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className={buttonOutlineClass}>
        Cancelar pedido
      </button>
    );
  }

  async function confirmar() {
    setSaving(true);
    setError(null);
    try {
      await pmCancelar(pedido.id, motivo);
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
        placeholder="Motivo"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className={inputClass}
      />
      <ErrorBox error={error} />
      <div className="flex gap-2">
        <button type="button" onClick={confirmar} disabled={saving} className={buttonClass}>
          {saving ? "Guardando..." : "Confirmar cancelación"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className={buttonOutlineClass}>
          Volver
        </button>
      </div>
    </div>
  );
}

function PedidoCard({
  pedido,
  children,
}: {
  pedido: PedidoMedidaCobro;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[3px] border border-arena bg-blanco px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-negro">
            #{pedido.numero} · {pedido.nombre}
          </p>
          <p className="text-xs text-taupe">{pedido.celular} · {pedido.email}</p>
          {pedido.descripcion && <p className="text-xs text-taupe">{pedido.descripcion}</p>}
        </div>
        <div className="text-right text-xs text-chocolate">
          <p>Presupuesto: {currencyFormatter.format(pedido.monto_presupuestado)}</p>
          <p>Pagado: {currencyFormatter.format(pedido.pagado)}</p>
          <p>Saldo: {currencyFormatter.format(pedido.saldo)}</p>
          {pedido.fecha_retiro && <p>Retiro: {pedido.fecha_retiro}</p>}
          {pedido.factura_numero && <p>Factura: {pedido.factura_numero}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

type Pestania = "senia" | "saldo" | "facturar" | "confeccion" | "entregados";

const PESTANIAS: { id: Pestania; label: string }[] = [
  { id: "senia", label: "Seña pendiente" },
  { id: "saldo", label: "Saldo a cobrar" },
  { id: "facturar", label: "Por facturar y entregar" },
  { id: "confeccion", label: "En confección" },
  { id: "entregados", label: "Entregados" },
];

function CobrosSection() {
  const [pedidos, setPedidos] = useState<PedidoMedidaCobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [pestania, setPestania] = useState<Pestania>("senia");
  const { staffRol } = useAuth();

  async function load() {
    setLoading(true);
    try {
      setPedidos(await fetchPedidosMedidaCobros());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const porPestania: Record<Pestania, PedidoMedidaCobro[]> = {
    senia: pedidos.filter((p) => p.estado === "pendiente_senia"),
    saldo: pedidos.filter((p) => p.estado === "terminado"),
    facturar: pedidos.filter((p) => p.estado === "pagado"),
    confeccion: pedidos.filter((p) => p.estado === "en_confeccion"),
    entregados: pedidos.filter((p) => p.estado === "entregado"),
  };

  const lista = porPestania[pestania];

  return (
    <section>
      <h2 className="text-lg font-normal tracking-tight text-negro">Cobros</h2>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-arena pb-2">
        {PESTANIAS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPestania(t.id)}
            className={`flex min-h-11 items-center rounded-[3px] px-3 text-xs font-medium uppercase tracking-wider transition-colors ${
              pestania === t.id ? "bg-negro text-blanco" : "text-taupe hover:text-chocolate"
            }`}
          >
            {t.label} ({porPestania[t.id].length})
          </button>
        ))}
      </nav>

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-taupe">Cargando...</p>
        ) : lista.length === 0 ? (
          <p className="text-sm text-taupe">No hay pedidos en esta lista.</p>
        ) : (
          lista.map((p) => (
            <PedidoCard key={p.id} pedido={p}>
              {pestania === "senia" && (
                <RegistrarPagoForm pedido={p} sugerido={p.senia_pendiente} onDone={load} />
              )}
              {pestania === "saldo" && (
                <RegistrarPagoForm pedido={p} sugerido={p.saldo} onDone={load} />
              )}
              {pestania === "facturar" && !p.factura_numero && (
                <FacturarForm pedido={p} onDone={load} />
              )}
              {pestania === "facturar" && p.factura_numero && <EntregarButton pedido={p} onDone={load} />}
              {staffRol !== "modista" && pestania !== "entregados" && (
                <CancelarPedidoButton pedido={p} onDone={load} />
              )}
            </PedidoCard>
          ))
        )}
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

function PedidosMedidaContent() {
  const { staffRol } = useAuth();
  const verModista = staffRol === "modista" || staffRol === "admin" || staffRol === null;
  const verCobros = staffRol === "caja" || staffRol === "admin" || staffRol === null;

  return (
    <div className="flex flex-col gap-12">
      {verModista && <ModistaSection />}
      {verCobros && <CobrosSection />}
    </div>
  );
}

export default function AdminPedidosMedidaPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">A medida</h1>
            <p className="mt-1 text-sm text-chocolate">Pedidos a medida del atelier: modista y cobros.</p>
            <div className="mt-8">
              <PedidosMedidaContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
