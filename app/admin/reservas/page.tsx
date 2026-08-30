"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import {
  addDays,
  getMonthMatrix,
  nextBusinessDay,
  sugerirDevolucion,
  toISODate,
} from "@/lib/disponibilidad";
import type { Client, Product } from "@/lib/supabase/types";

type ReservaCalendario = {
  id: string;
  product_id: string;
  fecha_retiro: string;
  fecha_devolucion: string;
  estado: string;
  products: { nombre: string } | null;
  clients: { nombre: string } | null;
};

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const MEDIOS_PAGO = [
  { value: "", label: "Sin especificar" },
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "otro", label: "Otro" },
];

function CargarReservaForm({ onCreated }: { onCreated: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [productId, setProductId] = useState("");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientSearch, setClientSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newCelular, setNewCelular] = useState("");
  const [fechaRetiro, setFechaRetiroState] = useState(nextBusinessDay(toISODate(new Date())));
  const [fechaDevolucion, setFechaDevolucion] = useState(() =>
    sugerirDevolucion(nextBusinessDay(toISODate(new Date())))
  );
  const [devolucionManual, setDevolucionManual] = useState(false);
  const [retiroAjustado, setRetiroAjustado] = useState(false);
  const [precioTotal, setPrecioTotal] = useState("");
  const [senia, setSenia] = useState("");
  const [depositoGarantia, setDepositoGarantia] = useState("");
  const [medioPago, setMedioPago] = useState("");
  const [contratoAceptado, setContratoAceptado] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      const supabase = getSupabaseClient();
      const [{ data: productsData }, { data: clientsData }] = await Promise.all([
        supabase.from("products").select("*").neq("estado", "baja_definitiva").order("nombre"),
        supabase.from("clients").select("*").order("nombre"),
      ]);
      setProducts(productsData ?? []);
      setClients(clientsData ?? []);
      setLoadingData(false);
    }
    load();
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.celular.includes(q)
    );
  }, [clients, clientSearch]);

  function handleFechaRetiroChange(value: string) {
    const ajustada = nextBusinessDay(value);
    setRetiroAjustado(ajustada !== value);
    setFechaRetiroState(ajustada);
    if (!devolucionManual) {
      setFechaDevolucion(sugerirDevolucion(ajustada));
    }
  }

  function handleFechaDevolucionChange(value: string) {
    setDevolucionManual(true);
    setFechaDevolucion(value);
  }

  function handleProductChange(id: string) {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    if (product) {
      setPrecioTotal(String(product.precio_alquiler));
      setSenia(String(Math.round(product.precio_alquiler * 0.5)));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!productId) {
      setError("Elegí una prenda.");
      return;
    }
    if (clientMode === "existing" && !clientId) {
      setError("Elegí una clienta o cargá una nueva.");
      return;
    }
    if (clientMode === "new" && (!newNombre || !newCelular)) {
      setError("Nombre y celular son obligatorios para una clienta nueva.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      let finalClientId = clientId;

      if (clientMode === "new") {
        const { data, error: clientError } = await supabase
          .from("clients")
          .insert({ nombre: newNombre, celular: newCelular })
          .select()
          .single();

        if (clientError) {
          setError(
            clientError.code === "23505"
              ? "Ya existe una clienta con ese celular."
              : clientError.message
          );
          return;
        }
        finalClientId = data.id;
      }

      const { error: reservaError } = await supabase.from("reservations").insert({
        product_id: productId,
        client_id: finalClientId,
        fecha_retiro: fechaRetiro,
        fecha_devolucion: fechaDevolucion,
        precio_total: precioTotal ? Number(precioTotal) : 0,
        senia: senia ? Number(senia) : 0,
        deposito_garantia: depositoGarantia ? Number(depositoGarantia) : null,
        medio_pago: medioPago || null,
        contrato_aceptado: contratoAceptado,
      });

      if (reservaError) {
        setError(
          reservaError.code === "23P01"
            ? "Esa prenda ya tiene una reserva que se superpone con esas fechas."
            : reservaError.message
        );
        return;
      }

      setSuccess(true);
      setProductId("");
      setClientId("");
      setClientSearch("");
      setNewNombre("");
      setNewCelular("");
      setPrecioTotal("");
      setSenia("");
      setDepositoGarantia("");
      setMedioPago("");
      setContratoAceptado(false);
      const retiroReset = nextBusinessDay(toISODate(new Date()));
      setFechaRetiroState(retiroReset);
      setFechaDevolucion(sugerirDevolucion(retiroReset));
      setDevolucionManual(false);
      setRetiroAjustado(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) return <p className="text-sm text-taupe">Cargando...</p>;

  const clienteElegida = clients.find((c) => c.id === clientId);
  const avisoDescuento =
    clientMode === "existing" && clienteElegida
      ? clienteElegida.alquileres_completados === 2
        ? "Esta clienta tiene 25% OFF disponible: este va a ser su 3er alquiler."
        : clienteElegida.alquileres_completados === 5
          ? "Esta clienta tiene 50% OFF disponible: este va a ser su 6to alquiler."
          : null
      : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-negro">
        Prenda
        <select
          value={productId}
          onChange={(e) => handleProductChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Elegir prenda...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.talle ? `(${p.talle})` : ""} — {p.sku}
            </option>
          ))}
        </select>
      </label>

      <div>
        <div className="flex gap-4 text-sm text-negro">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={clientMode === "existing"}
              onChange={() => setClientMode("existing")}
            />
            Clienta existente
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={clientMode === "new"}
              onChange={() => setClientMode("new")}
            />
            Clienta nueva
          </label>
        </div>

        {clientMode === "existing" ? (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre o celular..."
              value={clienteElegida ? clienteElegida.nombre : clientSearch}
              onChange={(e) => {
                setClientId("");
                setClientSearch(e.target.value);
              }}
              className={inputClass}
            />
            {!clienteElegida && clientSearch && (
              <div className="max-h-40 overflow-y-auto rounded-[3px] border border-arena bg-blanco">
                {clientesFiltrados.length === 0 && (
                  <p className="p-3 text-sm text-taupe">Sin resultados.</p>
                )}
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setClientId(c.id);
                      setClientSearch("");
                    }}
                    className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm text-negro hover:bg-crema"
                  >
                    <span>{c.nombre}</span>
                    <span className="text-taupe">{c.celular}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-negro">
              Nombre
              <input
                type="text"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-negro">
              Celular
              <input
                type="tel"
                value={newCelular}
                onChange={(e) => setNewCelular(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        )}

        {avisoDescuento && (
          <p className="mt-2 rounded-[3px] bg-crema px-3 py-2 text-sm text-chocolate">
            {avisoDescuento}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-negro">
          Fecha de retiro
          <input
            type="date"
            required
            value={fechaRetiro}
            onChange={(e) => handleFechaRetiroChange(e.target.value)}
            className={inputClass}
          />
          {retiroAjustado && (
            <span className="text-xs text-taupe">
              Ajustada: no abrimos los domingos.
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Fecha de devolución
          <input
            type="date"
            required
            value={fechaDevolucion}
            onChange={(e) => handleFechaDevolucionChange(e.target.value)}
            className={inputClass}
          />
          <span className="text-xs text-taupe">
            Sugerida automáticamente, se puede editar para acordar un período mayor.
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-negro">
          Precio total
          <input
            type="number"
            min="0"
            value={precioTotal}
            onChange={(e) => setPrecioTotal(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Seña
          <input
            type="number"
            min="0"
            value={senia}
            onChange={(e) => setSenia(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-negro">
          Depósito garantía
          <input
            type="number"
            min="0"
            value={depositoGarantia}
            onChange={(e) => setDepositoGarantia(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-negro">
        Medio de pago
        <select
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          className={inputClass}
        >
          {MEDIOS_PAGO.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-h-11 items-center gap-2 text-sm text-negro">
        <input
          type="checkbox"
          checked={contratoAceptado}
          onChange={(e) => setContratoAceptado(e.target.checked)}
          className="h-5 w-5"
        />
        Contrato aceptado
      </label>

      {error && <p className="text-sm text-chocolate">{error}</p>}
      {success && <p className="text-sm text-chocolate">Reserva cargada.</p>}

      <button
        type="submit"
        disabled={saving}
        className="flex min-h-11 items-center justify-center rounded-[3px] bg-negro px-6 text-sm font-medium text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Cargar reserva"}
      </button>
    </form>
  );
}

function Calendario() {
  const [reservas, setReservas] = useState<ReservaCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await getSupabaseClient()
      .from("reservations")
      .select("id, product_id, fecha_retiro, fecha_devolucion, estado, products(nombre), clients(nombre)")
      .neq("estado", "cancelado");
    setReservas((data ?? []) as unknown as ReservaCalendario[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);

  function reservasDelDia(iso: string) {
    return reservas.filter((r) => r.fecha_retiro <= iso && iso <= r.fecha_devolucion);
  }

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }

  const nombreMes = new Date(year, month, 1).toLocaleDateString("es-UY", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex min-h-11 items-center px-2 text-sm text-negro hover:text-chocolate"
        >
          ← Anterior
        </button>
        <span className="text-sm font-medium capitalize text-negro">{nombreMes}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex min-h-11 items-center px-2 text-sm text-negro hover:text-chocolate"
        >
          Siguiente →
        </button>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-taupe">Cargando calendario...</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wider text-taupe">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {weeks.flat().map((date) => {
              const iso = toISODate(date);
              const inMonth = date.getMonth() === month;
              const count = reservasDelDia(iso).length;
              const isSelected = selectedDay === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDay(iso)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-[3px] border text-xs transition-colors ${
                    isSelected
                      ? "border-negro bg-negro text-blanco"
                      : inMonth
                        ? "border-arena bg-blanco text-negro hover:border-chocolate"
                        : "border-arena bg-crema text-taupe"
                  }`}
                >
                  <span>{date.getDate()}</span>
                  {count > 0 && (
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-blanco" : "bg-chocolate"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {selectedDay && (
        <div className="mt-6">
          <h3 className="text-sm font-medium uppercase tracking-wider text-taupe">
            {selectedDay}
          </h3>
          {reservasDelDia(selectedDay).length === 0 ? (
            <p className="mt-2 text-sm text-taupe">Sin reservas ese día.</p>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {reservasDelDia(selectedDay).map((r) => (
                <div
                  key={r.id}
                  className="rounded-[3px] border border-arena bg-blanco p-3 text-sm"
                >
                  <p className="font-medium text-negro">{r.products?.nombre ?? "Prenda"}</p>
                  <p className="text-taupe">
                    {r.clients?.nombre ?? "Clienta"} · {r.fecha_retiro} → {r.fecha_devolucion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ESTADOS_RESERVA = [
  "reservado",
  "confirmado_retiro",
  "retirado",
  "devuelto",
  "vencido",
  "cancelado",
] as const;

const ESTADO_RESERVA_LABEL: Record<(typeof ESTADOS_RESERVA)[number], string> = {
  reservado: "Reservado",
  confirmado_retiro: "Confirmado para retiro",
  retirado: "Retirado",
  devuelto: "Devuelto",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

type ReservaActiva = {
  id: string;
  client_id: string;
  fecha_retiro: string;
  fecha_devolucion: string;
  estado: (typeof ESTADOS_RESERVA)[number];
  products: { nombre: string } | null;
  clients: { nombre: string } | null;
};

function ReservasActivas({ refreshKey }: { refreshKey: number }) {
  const [reservas, setReservas] = useState<ReservaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await getSupabaseClient()
      .from("reservations")
      .select("id, client_id, fecha_retiro, fecha_devolucion, estado, products(nombre), clients(nombre)")
      .neq("estado", "cancelado")
      .order("fecha_retiro", { ascending: true });
    if (error) setError(error.message);
    setReservas((data ?? []) as unknown as ReservaActiva[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function handleEstadoChange(reserva: ReservaActiva, nuevoEstado: (typeof ESTADOS_RESERVA)[number]) {
    setUpdatingId(reserva.id);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ estado: nuevoEstado })
        .eq("id", reserva.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (nuevoEstado === "devuelto" && reserva.estado !== "devuelto") {
        const { error: rpcError } = await supabase.rpc("increment_alquileres_completados", {
          p_client_id: reserva.client_id,
        });
        if (rpcError) setError(rpcError.message);
      }

      setReservas((prev) =>
        prev.map((r) => (r.id === reserva.id ? { ...r, estado: nuevoEstado } : r))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="text-sm text-taupe">Cargando reservas...</p>;

  return (
    <div>
      {error && <p className="mb-3 text-sm text-chocolate">{error}</p>}
      {reservas.length === 0 ? (
        <p className="text-sm text-taupe">No hay reservas activas.</p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-arena">
          <table className="min-w-full divide-y divide-arena">
            <thead className="bg-crema">
              <tr>
                {["Prenda", "Clienta", "Retiro", "Devolución", "Estado"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-taupe"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-arena bg-blanco">
              {reservas.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm font-medium text-negro">
                    {r.products?.nombre ?? "Prenda"}
                  </td>
                  <td className="px-4 py-3 text-sm text-chocolate">
                    {r.clients?.nombre ?? "Clienta"}
                  </td>
                  <td className="px-4 py-3 text-sm text-chocolate">{r.fecha_retiro}</td>
                  <td className="px-4 py-3 text-sm text-chocolate">{r.fecha_devolucion}</td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={r.estado}
                      disabled={updatingId === r.id}
                      onChange={(e) =>
                        handleEstadoChange(r, e.target.value as (typeof ESTADOS_RESERVA)[number])
                      }
                      className={`${inputClass} py-1`}
                    >
                      {ESTADOS_RESERVA.map((estado) => (
                        <option key={estado} value={estado}>
                          {ESTADO_RESERVA_LABEL[estado]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReservasContent() {
  const [calendarKey, setCalendarKey] = useState(0);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-normal tracking-tight text-negro">Cargar reserva</h2>
          <div className="mt-4">
            <CargarReservaForm onCreated={() => setCalendarKey((k) => k + 1)} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-normal tracking-tight text-negro">Calendario</h2>
          <div className="mt-4">
            <Calendario key={calendarKey} />
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-lg font-normal tracking-tight text-negro">Reservas activas</h2>
        <p className="mt-1 text-sm text-chocolate">
          Cambiá el estado a medida que se retiran y devuelven las prendas. Al marcar
          &quot;Devuelto&quot; se suma un sellito a la tarjeta de fidelidad de la clienta.
        </p>
        <div className="mt-4">
          <ReservasActivas refreshKey={calendarKey} />
        </div>
      </section>
    </div>
  );
}

export default function AdminReservasPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Reservas
            </h1>
            <p className="mt-1 text-sm text-chocolate">
              Cargá una nueva reserva y mirá el calendario.
            </p>
            <div className="mt-8">
              <ReservasContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
