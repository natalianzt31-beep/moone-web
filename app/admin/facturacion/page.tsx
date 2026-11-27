"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { ROLES_ADMIN_CAJA } from "@/lib/adminAccess";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import { addDays, toISODate } from "@/lib/disponibilidad";

const inputClass =
  "min-h-11 rounded-[3px] border border-taupe bg-blanco px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

type FilaFacturacion = {
  id: string;
  pedido_id: string | null;
  numero_pedido: number | null;
  estado: string;
  tipo: "alquiler" | "venta";
  precio_total: number;
  senia: number;
  saldo_pagado: boolean;
  eticket_numero: string | null;
  facturada_at: string | null;
  products: {
    sku: string;
    nombre: string;
    talle: string | null;
    precio_alquiler: number;
    precio_venta: number | null;
  } | null;
  clients: {
    nombre: string;
    celular: string | null;
    documento: string | null;
    email: string | null;
  } | null;
};

type Pedido = {
  key: string;
  numeroPedido: number | null;
  cliente: FilaFacturacion["clients"];
  items: FilaFacturacion[];
  total: number;
  numeroFactura: string | null;
  facturadaAt: string | null;
};

function precioDeCatalogo(item: FilaFacturacion) {
  const p = item.products;
  if (!p) return null;
  return item.tipo === "venta" ? (p.precio_venta ?? p.precio_alquiler) : p.precio_alquiler;
}

function descuento(item: FilaFacturacion) {
  const catalogo = precioDeCatalogo(item);
  if (catalogo == null) return 0;
  const dif = catalogo - item.precio_total;
  return dif > 0 ? dif : 0;
}

function pagoCompleto(item: FilaFacturacion) {
  return item.saldo_pagado || item.senia >= item.precio_total;
}

function salioDelLocal(item: FilaFacturacion) {
  return item.tipo === "venta" || ["retirado", "en_limpieza", "devuelto"].includes(item.estado);
}

function agruparPorPedido(filas: FilaFacturacion[]): Pedido[] {
  const grupos = new Map<string, FilaFacturacion[]>();
  for (const f of filas) {
    const key = f.pedido_id ?? f.id;
    const lista = grupos.get(key) ?? [];
    lista.push(f);
    grupos.set(key, lista);
  }
  return [...grupos.entries()].map(([key, items]) => {
    const primero = items[0];
    const conFactura = items.find((it) => it.eticket_numero);
    return {
      key,
      numeroPedido: primero.numero_pedido,
      cliente: primero.clients,
      items,
      total: items.reduce((acc, it) => acc + it.precio_total, 0),
      numeroFactura: conFactura?.eticket_numero ?? null,
      facturadaAt: conFactura?.facturada_at ?? null,
    };
  });
}

function FacturaNumeroControl({ pedido, onGuardado }: { pedido: Pedido; onGuardado: () => void }) {
  const [valor, setValor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {
    if (!valor.trim()) {
      setError("Ingresá el número de factura.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const ids = pedido.items.map((it) => it.id);
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ eticket_numero: valor.trim(), facturada_at: new Date().toISOString() })
        .in("id", ids);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="N° de factura"
          className={`${inputClass} w-36 py-1 text-sm`}
        />
        <button
          type="button"
          onClick={handleGuardar}
          disabled={saving}
          className="whitespace-nowrap rounded-[3px] bg-negro px-3 py-1 text-xs font-medium uppercase tracking-wider text-blanco transition-colors hover:bg-chocolate disabled:opacity-60"
        >
          {saving ? "..." : "Guardar"}
        </button>
      </div>
      {error && <p className="text-xs text-chocolate">{error}</p>}
    </div>
  );
}

function TarjetaPedidoPendiente({ pedido, onFacturada }: { pedido: Pedido; onFacturada: () => void }) {
  return (
    <div className="rounded-[3px] border border-arena bg-blanco p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-negro">
            Pedido #{pedido.numeroPedido ?? "—"} · {pedido.cliente?.nombre ?? "Clienta"}
          </p>
          <p className="mt-1 text-xs text-taupe">
            {pedido.cliente?.celular ?? "Sin celular"} · {pedido.cliente?.documento ?? "Sin cédula"} ·{" "}
            {pedido.cliente?.email ?? "Sin mail"}
          </p>
        </div>
        <FacturaNumeroControl pedido={pedido} onGuardado={onFacturada} />
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {pedido.items.map((it) => {
          const desc = descuento(it);
          return (
            <li key={it.id} className="flex items-center justify-between text-sm text-chocolate">
              <span>
                {it.products?.sku ?? "—"} · {it.products?.nombre ?? "Prenda"}
                {it.products?.talle ? ` (${it.products.talle})` : ""}
                {it.tipo === "venta" && (
                  <span className="ml-1 text-xs uppercase tracking-wider text-taupe">Venta</span>
                )}
              </span>
              <span className="text-negro">
                {currencyFormatter.format(it.precio_total)}
                {desc > 0 && (
                  <span className="ml-1 text-xs text-taupe">
                    (descuento {currencyFormatter.format(desc)})
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-right text-sm font-medium text-negro">
        Total: {currencyFormatter.format(pedido.total)}
      </p>
    </div>
  );
}

function FacturasPendientes({ refreshKey, onFacturada }: { refreshKey: number; onFacturada: () => void }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const desde = addDays(toISODate(new Date()), -120);
      const { data, error } = await getSupabaseClient()
        .from("reservations")
        .select(
          "id, pedido_id, numero_pedido, estado, tipo, precio_total, senia, saldo_pagado, eticket_numero, facturada_at, products(sku, nombre, talle, precio_alquiler, precio_venta), clients(nombre, celular, documento, email)"
        )
        .neq("estado", "cancelado")
        .gte("fecha_retiro", desde)
        .order("fecha_retiro", { ascending: true });

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const filas = (data ?? []) as unknown as FilaFacturacion[];
      const pedidosTodos = agruparPorPedido(filas);
      const pendientes = pedidosTodos.filter(
        (p) =>
          !p.numeroFactura &&
          p.items.every((it) => salioDelLocal(it)) &&
          p.items.every((it) => pagoCompleto(it))
      );
      setPedidos(pendientes);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) return <p className="text-sm text-taupe">Cargando...</p>;
  if (error) return <p className="text-sm text-chocolate">Error al cargar: {error}</p>;
  if (pedidos.length === 0) {
    return <p className="text-sm text-taupe">No hay facturas pendientes por ahora.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {pedidos.map((p) => (
        <TarjetaPedidoPendiente key={p.key} pedido={p} onFacturada={onFacturada} />
      ))}
    </div>
  );
}

function FacturasDelMes({ refreshKey }: { refreshKey: number }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
      const { data, error } = await getSupabaseClient()
        .from("reservations")
        .select(
          "id, pedido_id, numero_pedido, estado, tipo, precio_total, senia, saldo_pagado, eticket_numero, facturada_at, products(sku, nombre, talle, precio_alquiler, precio_venta), clients(nombre, celular, documento, email)"
        )
        .not("eticket_numero", "is", null)
        .gte("facturada_at", inicioMes)
        .order("facturada_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const filas = (data ?? []) as unknown as FilaFacturacion[];
      setPedidos(agruparPorPedido(filas));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) return <p className="text-sm text-taupe">Cargando...</p>;
  if (error) return <p className="text-sm text-chocolate">Error al cargar: {error}</p>;
  if (pedidos.length === 0) {
    return <p className="text-sm text-taupe">Todavía no se cargó ninguna factura este mes.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-[3px] border border-arena">
      <table className="min-w-full divide-y divide-arena">
        <thead className="bg-crema">
          <tr>
            {["Facturada", "Pedido", "Clienta", "N° factura", "Total"].map((h) => (
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
          {pedidos.map((p) => (
            <tr key={p.key}>
              <td className="px-4 py-3 text-sm text-chocolate">
                {p.facturadaAt ? new Date(p.facturadaAt).toLocaleDateString("es-UY") : "—"}
              </td>
              <td className="px-4 py-3 text-sm text-chocolate">#{p.numeroPedido ?? "—"}</td>
              <td className="px-4 py-3 text-sm text-negro">{p.cliente?.nombre ?? "Clienta"}</td>
              <td className="px-4 py-3 text-sm text-chocolate">{p.numeroFactura}</td>
              <td className="px-4 py-3 text-sm text-negro">{currencyFormatter.format(p.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FacturacionContent() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-normal tracking-tight text-negro">Facturas pendientes</h2>
        <p className="mt-1 text-sm text-chocolate">
          Pedidos ya retirados (o vendidos) y cobrados en su totalidad, listos para cargar en
          Memory. Con los datos de acá alcanza para hacer la factura: nombre, celular, cédula,
          mail, artículos, precios y descuentos. Cuando la hagas, anotá el número acá y pasa a
          &quot;Facturas ya hechas del mes&quot;.
        </p>
        <div className="mt-4">
          <FacturasPendientes refreshKey={refreshKey} onFacturada={() => setRefreshKey((k) => k + 1)} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-normal tracking-tight text-negro">Facturas ya hechas del mes</h2>
        <div className="mt-4">
          <FacturasDelMes refreshKey={refreshKey} />
        </div>
      </section>
    </div>
  );
}

export default function AdminFacturacionPage() {
  return (
    <div className="flex flex-1 flex-col bg-marfil">
      <RequireStaff roles={ROLES_ADMIN_CAJA}>
        <AdminNav />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
            <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
              Facturación
            </h1>
            <p className="mt-1 text-sm text-chocolate">
              Qué falta facturar en Memory y qué ya se facturó este mes.
            </p>
            <div className="mt-8">
              <FacturacionContent />
            </div>
          </div>
        </main>
      </RequireStaff>
    </div>
  );
}
