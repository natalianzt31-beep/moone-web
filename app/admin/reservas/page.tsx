"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { ROLES_ADMIN_CAJA } from "@/lib/adminAccess";
import { QrScannerModal } from "@/components/QrScannerModal";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import { fetchClosedDatesSet } from "@/lib/supabase/closedDates";
import {
  addDays,
  nextBusinessDay,
  sugerirDevolucion,
  toISODate,
} from "@/lib/disponibilidad";
import type { Client, Product } from "@/lib/supabase/types";

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

type ItemCarga = {
  key: string;
  productId: string;
  skuInput: string;
  precioTotal: string;
  senia: string;
};

function itemVacio(): ItemCarga {
  return { key: crypto.randomUUID(), productId: "", skuInput: "", precioTotal: "", senia: "" };
}

function CargarReservaForm({ onCreated }: { onCreated: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [items, setItems] = useState<ItemCarga[]>([itemVacio()]);
  const [escaneandoKey, setEscaneandoKey] = useState<string | null>(null);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [clientSearch, setClientSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newCelular, setNewCelular] = useState("");
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [fechaRetiro, setFechaRetiroState] = useState(toISODate(new Date()));
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [devolucionManual, setDevolucionManual] = useState(false);
  const [retiroAjustado, setRetiroAjustado] = useState(false);
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
      const [{ data: productsData }, { data: clientsData }, closed] = await Promise.all([
        supabase.from("products").select("*").neq("estado", "baja_definitiva").order("nombre"),
        supabase.from("clients").select("*").order("nombre"),
        fetchClosedDatesSet(),
      ]);
      setProducts(productsData ?? []);
      setClients(clientsData ?? []);
      setClosedDates(closed);

      const retiroDefault = nextBusinessDay(toISODate(new Date()), closed);
      setFechaRetiroState(retiroDefault);
      setFechaDevolucion(sugerirDevolucion(retiroDefault, closed));

      setLoadingData(false);
    }
    load();
  }, []);

  const clientesFiltrados = useMemo(() => {
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) => c.nombre.toLowerCase().includes(q) || (c.celular ?? "").includes(q)
    );
  }, [clients, clientSearch]);

  function handleFechaRetiroChange(value: string) {
    const ajustada = nextBusinessDay(value, closedDates);
    setRetiroAjustado(ajustada !== value);
    setFechaRetiroState(ajustada);
    if (!devolucionManual) {
      setFechaDevolucion(sugerirDevolucion(ajustada, closedDates));
    }
  }

  function handleFechaDevolucionChange(value: string) {
    setDevolucionManual(true);
    setFechaDevolucion(value);
  }

  function actualizarItem(key: string, cambios: Partial<ItemCarga>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...cambios } : it)));
  }

  function handleProductChangeForItem(key: string, id: string) {
    const product = products.find((p) => p.id === id);
    if (product) {
      actualizarItem(key, {
        productId: id,
        skuInput: product.sku,
        precioTotal: String(product.precio_alquiler),
        senia: String(Math.round(product.precio_alquiler * 0.5)),
      });
    } else {
      actualizarItem(key, { productId: id });
    }
  }

  function handleSkuInputChangeForItem(key: string, value: string) {
    const sku = value.trim().toUpperCase();
    if (!sku) {
      actualizarItem(key, { skuInput: value, productId: "" });
      return;
    }
    const product = products.find((p) => p.sku.toUpperCase() === sku);
    if (product) {
      actualizarItem(key, {
        skuInput: value,
        productId: product.id,
        precioTotal: String(product.precio_alquiler),
        senia: String(Math.round(product.precio_alquiler * 0.5)),
      });
    } else {
      actualizarItem(key, { skuInput: value, productId: "" });
    }
  }

  function agregarItem() {
    setItems((prev) => [...prev, itemVacio()]);
  }

  function quitarItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));
  }

  /** Las etiquetas codifican la URL de la ficha (ej. .../p/VES-00333) — nos
   * quedamos con el último segmento, o con el texto tal cual si no es una
   * URL. */
  function skuDesdeTextoEscaneado(texto: string): string {
    const limpio = texto.trim();
    try {
      const url = new URL(limpio);
      const segmentos = url.pathname.split("/").filter(Boolean);
      if (segmentos.length > 0) return segmentos[segmentos.length - 1].toUpperCase();
    } catch {
      // No es una URL completa: seguimos con el texto tal cual.
    }
    return limpio.toUpperCase();
  }

  function handleScan(textoDecodificado: string) {
    const key = escaneandoKey;
    setEscaneandoKey(null);
    if (!key) return;
    const sku = skuDesdeTextoEscaneado(textoDecodificado);
    const product = products.find((p) => p.sku.toUpperCase() === sku);
    if (!product) {
      setError(`No encontramos ninguna prenda con el SKU "${sku}".`);
      return;
    }
    setError(null);
    handleProductChangeForItem(key, product.id);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const indiceSinPrenda = items.findIndex((it) => !it.productId);
    if (indiceSinPrenda !== -1) {
      setError(
        items.length > 1
          ? `Elegí una prenda en el artículo ${indiceSinPrenda + 1}.`
          : "Elegí una prenda."
      );
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

      // Un mismo pedido_id (y por lo tanto un mismo N° de pedido, que lo
      // asigna solo un trigger) para todos los artículos cargados juntos acá.
      const pedidoId = crypto.randomUUID();

      const { data: reservasCreadas, error: reservaError } = await supabase
        .from("reservations")
        .insert(
          items.map((item) => ({
            product_id: item.productId,
            client_id: finalClientId,
            fecha_retiro: fechaRetiro,
            fecha_devolucion: fechaDevolucion,
            precio_total: item.precioTotal ? Number(item.precioTotal) : 0,
            senia: item.senia ? Number(item.senia) : 0,
            deposito_garantia: depositoGarantia ? Number(depositoGarantia) : null,
            medio_pago: medioPago || null,
            contrato_aceptado: contratoAceptado,
            origen: "admin",
            pedido_id: pedidoId,
          }))
        )
        .select("id");

      if (reservaError || !reservasCreadas || reservasCreadas.length === 0) {
        setError(
          reservaError?.code === "23P01"
            ? "Una de esas prendas ya tiene una reserva que se superpone con esas fechas."
            : (reservaError?.message ?? "No se pudo cargar la reserva.")
        );
        return;
      }

      // Mail de confirmación a la clienta (uno solo, junta todo el pedido
      // por pedido_id) y aviso interno con foto por cada artículo a
      // contacto@: ninguno de los dos bloquea ni hace fallar la carga si el
      // mail no sale.
      try {
        const accessToken = await getAccessTokenOrThrow();
        await fetch("/api/admin/reservas/confirmar-nueva", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ reservationId: reservasCreadas[0].id }),
        });
      } catch {
        // Silencioso: la vendedora puede reenviar el mail desde otro lado si hace falta.
      }
      for (const reserva of reservasCreadas) {
        void avisarReservaNueva(reserva.id);
      }

      setSuccess(true);
      setItems([itemVacio()]);
      setClientId("");
      setClientSearch("");
      setNewNombre("");
      setNewCelular("");
      setDepositoGarantia("");
      setMedioPago("");
      setContratoAceptado(false);
      const retiroReset = nextBusinessDay(toISODate(new Date()), closedDates);
      setFechaRetiroState(retiroReset);
      setFechaDevolucion(sugerirDevolucion(retiroReset, closedDates));
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
      <div className="flex flex-col gap-4">
        {items.map((item, index) => {
          const encontrado = item.skuInput.trim()
            ? products.find((p) => p.sku.toUpperCase() === item.skuInput.trim().toUpperCase())
            : undefined;
          return (
            <div
              key={item.key}
              className="flex flex-col gap-3 rounded-[3px] border border-arena p-3"
            >
              {items.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-taupe">
                    Artículo {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitarItem(item.key)}
                    className="text-xs uppercase tracking-wider text-chocolate hover:text-negro"
                  >
                    Quitar
                  </button>
                </div>
              )}
              <label className="flex flex-col gap-1 text-sm text-negro">
                Prenda
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.skuInput}
                    onChange={(e) => handleSkuInputChangeForItem(item.key, e.target.value)}
                    placeholder="SKU (ej. VES-00123)"
                    className={`${inputClass} flex-1 uppercase placeholder:normal-case`}
                  />
                  <button
                    type="button"
                    onClick={() => setEscaneandoKey(item.key)}
                    aria-label="Escanear SKU con la cámara"
                    title="Escanear SKU con la cámara"
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-[3px] border border-taupe text-negro hover:border-negro"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 7a2 2 0 0 1 2-2h1.2l.9-1.4A1 1 0 0 1 9 3h6a1 1 0 0 1 .9.6L16.8 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
                      <circle cx="12" cy="13" r="3.4" />
                    </svg>
                  </button>
                </div>
                {item.skuInput.trim() && (
                  <p className={`text-xs ${item.productId ? "text-chocolate" : "text-taupe"}`}>
                    {encontrado
                      ? `${encontrado.nombre}${encontrado.talle ? ` (${encontrado.talle})` : ""} — ${currencyFormatter.format(encontrado.precio_alquiler)}`
                      : "No encontramos ninguna prenda con ese SKU."}
                  </p>
                )}
                <select
                  value={item.productId}
                  onChange={(e) => handleProductChangeForItem(item.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">...o elegí de la lista</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.talle ? `(${p.talle})` : ""} — {p.sku}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-negro">
                  Precio total
                  <input
                    type="number"
                    min="0"
                    value={item.precioTotal}
                    onChange={(e) => actualizarItem(item.key, { precioTotal: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-negro">
                  Seña
                  <input
                    type="number"
                    min="0"
                    value={item.senia}
                    onChange={(e) => actualizarItem(item.key, { senia: e.target.value })}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={agregarItem}
        className="flex min-h-11 items-center justify-center rounded-[3px] border border-dashed border-taupe text-sm text-chocolate transition-colors hover:border-negro hover:text-negro"
      >
        + Agregar otro artículo al mismo pedido
      </button>

      {escaneandoKey && (
        <QrScannerModal onScan={handleScan} onClose={() => setEscaneandoKey(null)} />
      )}

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
              Ajustada: el local está cerrado ese día (domingo o feriado).
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

      <label className="flex max-w-xs flex-col gap-1 text-sm text-negro">
        Depósito garantía
        <input
          type="number"
          min="0"
          value={depositoGarantia}
          onChange={(e) => setDepositoGarantia(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-taupe">Uno solo para todo el pedido, si corresponde.</span>
      </label>

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

const ESTADOS_RESERVA = [
  "reservado",
  "confirmado_retiro",
  "retirado",
  "en_limpieza",
  "devuelto",
  "vencido",
  "cancelado",
] as const;

const ESTADO_RESERVA_LABEL: Record<(typeof ESTADOS_RESERVA)[number], string> = {
  reservado: "Reservado",
  confirmado_retiro: "Confirmado para retiro",
  retirado: "Retirado",
  en_limpieza: "En limpieza",
  devuelto: "Devuelto",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

type ReservaActiva = {
  id: string;
  client_id: string;
  numero_pedido: number | null;
  fecha_retiro: string;
  fecha_devolucion: string;
  estado: (typeof ESTADOS_RESERVA)[number];
  senia: number;
  senia_confirmada: boolean;
  precio_total: number;
  saldo_pagado: boolean;
  eticket_generado: boolean;
  eticket_url: string | null;
  products: { sku: string; nombre: string } | null;
  clients: { nombre: string } | null;
};

async function getAccessTokenOrThrow(): Promise<string> {
  const { data } = await getSupabaseClient().auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
  return accessToken;
}

/** Pide al servidor el mail de aviso (con foto) de una reserva recién cargada. */
async function avisarReservaNueva(reservaId: string) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const res = await fetch("/api/admin/reservas/aviso-nueva", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ reservaId }),
    });
    if (!res.ok) console.error("No se pudo enviar el aviso de la reserva", await res.text());
  } catch (err) {
    console.error("No se pudo enviar el aviso de la reserva", err);
  }
}

function ConfirmarSeniaControl({
  reserva,
  onConfirmada,
}: {
  reserva: ReservaActiva;
  onConfirmada: () => void;
}) {
  const [medio, setMedio] = useState("efectivo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmar() {
    setSaving(true);
    setError(null);
    try {
      const accessToken = await getAccessTokenOrThrow();
      const res = await fetch("/api/admin/confirmar-senia-local", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ reservationId: reserva.id, medioPago: medio }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo confirmar la seña.");
      onConfirmada();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <select
          value={medio}
          onChange={(e) => setMedio(e.target.value)}
          disabled={saving}
          className={`${inputClass} py-1 text-xs`}
        >
          {MEDIOS_PAGO.filter((m) => m.value).map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleConfirmar}
          disabled={saving}
          className="whitespace-nowrap rounded-[3px] bg-negro px-3 py-1 text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
        >
          {saving ? "..." : "Confirmar seña"}
        </button>
      </div>
      {error && <p className="text-xs text-chocolate">{error}</p>}
    </div>
  );
}

function MarcarSaldoControl({
  reserva,
  onMarcado,
}: {
  reserva: ReservaActiva;
  onMarcado: () => void;
}) {
  const [medio, setMedio] = useState("efectivo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarcar() {
    setSaving(true);
    setError(null);
    try {
      const accessToken = await getAccessTokenOrThrow();
      const res = await fetch("/api/admin/marcar-saldo-pagado", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ reservationId: reserva.id, medioPago: medio }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo marcar el saldo como pagado.");
      onMarcado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  if (reserva.eticket_generado) {
    return (
      <a
        href={reserva.eticket_url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-chocolate underline-offset-2 hover:underline"
      >
        Ver comprobante
      </a>
    );
  }

  if (reserva.saldo_pagado) {
    return <span className="text-xs text-taupe">Saldo pagado · factura pendiente</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <select
          value={medio}
          onChange={(e) => setMedio(e.target.value)}
          disabled={saving}
          className={`${inputClass} py-1 text-xs`}
        >
          {MEDIOS_PAGO.filter((m) => m.value).map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleMarcar}
          disabled={saving}
          className="whitespace-nowrap rounded-[3px] border border-negro px-3 py-1 text-xs font-medium uppercase tracking-wider text-negro transition-colors hover:border-chocolate hover:text-chocolate disabled:opacity-60"
        >
          {saving ? "..." : "Marcar saldo pagado"}
        </button>
      </div>
      {error && <p className="text-xs text-chocolate">{error}</p>}
    </div>
  );
}

function ReservasActivas({ refreshKey }: { refreshKey: number }) {
  const [reservas, setReservas] = useState<ReservaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busquedaPedido, setBusquedaPedido] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await getSupabaseClient()
      .from("reservations")
      .select(
        "id, client_id, numero_pedido, fecha_retiro, fecha_devolucion, estado, senia, senia_confirmada, precio_total, saldo_pagado, eticket_generado, eticket_url, products(sku, nombre), clients(nombre)"
      )
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

      // El sellito de fidelidad ya no se suma acá: se suma solo al facturar
      // el alquiler (al marcar el saldo pagado), no al cambiar este estado
      // logístico.

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

  const reservasFiltradas = busquedaPedido.trim()
    ? reservas.filter((r) => String(r.numero_pedido ?? "").includes(busquedaPedido.trim()))
    : reservas;

  return (
    <div>
      {error && <p className="mb-3 text-sm text-chocolate">{error}</p>}
      <input
        type="text"
        inputMode="numeric"
        placeholder="Buscar por N° de pedido..."
        value={busquedaPedido}
        onChange={(e) => setBusquedaPedido(e.target.value)}
        className={`${inputClass} mb-3 w-full max-w-xs`}
      />
      {reservasFiltradas.length === 0 ? (
        <p className="text-sm text-taupe">
          {busquedaPedido.trim() ? "Ningún pedido coincide con esa búsqueda." : "No hay reservas activas."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-arena">
          <table className="min-w-full divide-y divide-arena">
            <thead className="bg-crema">
              <tr>
                {["Pedido", "Prenda", "Clienta", "Retiro", "Devolución", "Estado", "Seña", "Saldo / Factura"].map((h) => (
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
              {reservasFiltradas.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm text-chocolate">#{r.numero_pedido ?? "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-negro">
                    {r.products?.nombre ?? "Prenda"}
                    {r.products?.sku && (
                      <Link
                        href={`/admin/arreglos?sku=${encodeURIComponent(r.products.sku)}&reservationId=${r.id}`}
                        className="mt-1 block text-xs font-normal uppercase tracking-wider text-chocolate underline-offset-2 hover:underline"
                      >
                        Cargar arreglo
                      </Link>
                    )}
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
                  <td className="px-4 py-3 text-sm">
                    {r.senia_confirmada ? (
                      <span className="text-xs text-taupe">
                        Confirmada · {currencyFormatter.format(r.senia)}
                      </span>
                    ) : (
                      <ConfirmarSeniaControl reserva={r} onConfirmada={load} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <MarcarSaldoControl reserva={r} onMarcado={load} />
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
      <section className="max-w-xl">
        <h2 className="text-lg font-normal tracking-tight text-negro">Cargar reserva</h2>
        <div className="mt-4">
          <CargarReservaForm onCreated={() => setCalendarKey((k) => k + 1)} />
        </div>
      </section>

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
      <RequireStaff roles={ROLES_ADMIN_CAJA}>
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
