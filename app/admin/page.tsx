"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { RequireStaff } from "@/components/RequireStaff";
import { getSupabaseClient } from "@/lib/supabase/client";
import { currencyFormatter } from "@/lib/site-config";
import { addDays, toISODate } from "@/lib/disponibilidad";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ADMIN_MODULES, puedeAcceder } from "@/lib/adminAccess";

type ReservaFila = {
  id: string;
  client_id: string | null;
  fecha_retiro: string;
  fecha_devolucion: string;
  precio_total: number;
  senia: number;
  products: { sku: string; nombre: string; talle: string | null } | null;
  clients: { nombre: string; celular: string | null } | null;
};

type TurnoFila = {
  id: string;
  hora: string;
  nombre: string;
  celular: string;
};

type ArregloFila = {
  id: string;
  numero: number;
  estado: string;
  detalle: string;
  fecha_retiro_clienta: string;
  sku: string;
  nombre: string;
  talle: string | null;
};

type CobroMedidaFila = {
  id: string;
  numero: number;
  estado: string;
  nombre: string;
  saldo: number;
  fecha_retiro: string | null;
};

function formatFechaCorta(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Seccion({
  titulo,
  cantidad,
  children,
  verMasHref,
}: {
  titulo: string;
  cantidad: number;
  children: React.ReactNode;
  verMasHref?: string;
}) {
  return (
    <section className="rounded-[3px] border border-arena bg-blanco">
      <div className="flex items-center justify-between border-b border-arena px-5 py-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-negro">
          {titulo} <span className="text-taupe">({cantidad})</span>
        </h2>
        {verMasHref && (
          <Link
            href={verMasHref}
            className="flex min-h-11 items-center text-xs uppercase tracking-wider text-chocolate hover:text-negro"
          >
            Ver todo →
          </Link>
        )}
      </div>
      <div className="divide-y divide-arena">{children}</div>
    </section>
  );
}

function FilaVacia({ texto }: { texto: string }) {
  return <p className="px-5 py-6 text-sm text-taupe">{texto}</p>;
}

function FilaConCheck({
  titulo,
  subtitulo,
  etiqueta,
  etiquetaClass,
  checked,
  disabled,
  onToggle,
}: {
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  etiquetaClass?: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm hover:bg-crema">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 accent-negro"
      />
      <div className="flex flex-1 items-center justify-between gap-3">
        <div>
          <p className="font-medium text-negro">{titulo}</p>
          <p className="text-xs text-taupe">{subtitulo}</p>
        </div>
        <span className={`whitespace-nowrap text-xs uppercase tracking-wider ${etiquetaClass ?? "text-chocolate"}`}>
          {etiqueta}
        </span>
      </div>
    </label>
  );
}

type GrupoReservas = {
  clave: string;
  nombre: string;
  celular: string | null;
  reservas: ReservaFila[];
};

function agruparPorClienta(reservas: ReservaFila[]): GrupoReservas[] {
  const grupos = new Map<string, GrupoReservas>();
  for (const r of reservas) {
    const clave = r.client_id ?? `sin-clienta-${r.id}`;
    const grupo = grupos.get(clave);
    if (grupo) {
      grupo.reservas.push(r);
    } else {
      grupos.set(clave, {
        clave,
        nombre: r.clients?.nombre ?? "Clienta",
        celular: r.clients?.celular ?? null,
        reservas: [r],
      });
    }
  }
  return Array.from(grupos.values());
}

function descripcionPrenda(r: ReservaFila): string {
  return `${r.products?.sku} · ${r.products?.nombre}${r.products?.talle ? ` · ${r.products.talle}` : ""}`;
}

function GrupoClienta({
  grupo,
  textoTildarTodo,
  disabled,
  onTildarTodo,
  children,
}: {
  grupo: GrupoReservas;
  textoTildarTodo?: string;
  disabled?: boolean;
  onTildarTodo?: () => void;
  children: React.ReactNode;
}) {
  const cantidad = grupo.reservas.length;
  return (
    <div className="py-1">
      <div className="flex items-center justify-between gap-3 bg-crema/60 px-5 py-2">
        <div>
          <p className="text-sm font-medium text-negro">{grupo.nombre}</p>
          <p className="text-xs text-taupe">
            {cantidad} {cantidad === 1 ? "prenda" : "prendas"}
            {grupo.celular ? ` · ${grupo.celular}` : ""}
          </p>
        </div>
        {onTildarTodo && cantidad > 1 && (
          <button
            type="button"
            onClick={onTildarTodo}
            disabled={disabled}
            className="min-h-9 whitespace-nowrap rounded-[3px] border border-arena px-3 text-xs uppercase tracking-wider text-chocolate hover:border-chocolate hover:text-negro disabled:opacity-50"
          >
            {textoTildarTodo ?? "Tildar todas"}
          </button>
        )}
      </div>
      <div className="pl-4">{children}</div>
    </div>
  );
}

export default function AdminHomePage() {
  const { staffRol } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [retiros, setRetiros] = useState<ReservaFila[]>([]);
  const [devoluciones, setDevoluciones] = useState<ReservaFila[]>([]);
  const [limpieza, setLimpieza] = useState<ReservaFila[]>([]);
  const [pagosPendientes, setPagosPendientes] = useState<ReservaFila[]>([]);
  const [turnosHoy, setTurnosHoy] = useState<TurnoFila[]>([]);
  const [arreglosListos, setArreglosListos] = useState<ArregloFila[]>([]);
  const [cobrosMedida, setCobrosMedida] = useState<CobroMedidaFila[]>([]);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const verCaja = staffRol === "caja" || staffRol === "admin" || staffRol === null;
  const verModista = staffRol === "modista" || staffRol === "admin" || staffRol === null;
  const quickLinks = ADMIN_MODULES.filter(
    (modulo) => modulo.href !== "/admin" && puedeAcceder(modulo.roles, staffRol)
  );

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const supabase = getSupabaseClient();
      const hoy = toISODate(new Date());
      const manana = addDays(hoy, 1);

      const reservaSelect = "id, client_id, fecha_retiro, fecha_devolucion, precio_total, senia, products(sku, nombre, talle), clients(nombre, celular)";

      const [
        { data: retirosData },
        { data: devolucionesData },
        { data: limpiezaData },
        { data: pagosData },
        { data: turnosData },
        { data: arreglosData },
        { data: cobrosData },
      ] = await Promise.all([
        supabase
          .from("reservations")
          .select(reservaSelect)
          .in("estado", ["reservado", "confirmado_retiro"])
          .gte("fecha_retiro", addDays(hoy, -7))
          .lte("fecha_retiro", manana)
          .order("fecha_retiro"),
        supabase
          .from("reservations")
          .select(reservaSelect)
          .eq("estado", "retirado")
          .order("fecha_devolucion"),
        supabase
          .from("reservations")
          .select(reservaSelect)
          .eq("estado", "en_limpieza")
          .order("fecha_devolucion"),
        supabase
          .from("reservations")
          .select(reservaSelect)
          .not("estado", "in", "(devuelto,cancelado,vencido)")
          .eq("saldo_pagado", false)
          .order("fecha_retiro")
          .limit(40),
        supabase
          .from("citas_modista")
          .select("id, hora, nombre, celular")
          .eq("fecha", hoy)
          .eq("estado", "confirmada")
          .neq("nombre", "Bloqueado")
          .order("hora"),
        supabase
          .from("arreglos_bandeja")
          .select("id, numero, estado, detalle, fecha_retiro_clienta, sku, nombre, talle")
          .eq("estado", "pronto")
          .order("fecha_retiro_clienta"),
        supabase
          .from("pedidos_medida_cobros")
          .select("id, numero, estado, nombre, saldo, fecha_retiro")
          .not("estado", "in", "(entregado,cancelado)")
          .gt("saldo", 0)
          .order("fecha_retiro"),
      ]);

      setRetiros((retirosData as unknown as ReservaFila[]) ?? []);
      setDevoluciones((devolucionesData as unknown as ReservaFila[]) ?? []);
      setLimpieza((limpiezaData as unknown as ReservaFila[]) ?? []);
      setPagosPendientes((pagosData as unknown as ReservaFila[]) ?? []);
      setTurnosHoy(turnosData ?? []);
      setArreglosListos(arreglosData ?? []);
      setCobrosMedida(cobrosData ?? []);
      setCargando(false);
    }
    cargar();
  }, []);

  async function cambiarEstado(reserva: ReservaFila, nuevoEstado: string) {
    setActualizandoId(reserva.id);
    setErrorEstado(null);
    const { error } = await getSupabaseClient()
      .from("reservations")
      .update({ estado: nuevoEstado })
      .eq("id", reserva.id);

    if (error) {
      setErrorEstado(error.message);
      setActualizandoId(null);
      return;
    }

    if (nuevoEstado === "retirado") {
      setRetiros((prev) => prev.filter((r) => r.id !== reserva.id));
      setDevoluciones((prev) => [...prev, reserva].sort((a, b) => a.fecha_devolucion.localeCompare(b.fecha_devolucion)));
    } else if (nuevoEstado === "en_limpieza") {
      setDevoluciones((prev) => prev.filter((r) => r.id !== reserva.id));
      setLimpieza((prev) => [...prev, reserva]);
    } else if (nuevoEstado === "devuelto") {
      setLimpieza((prev) => prev.filter((r) => r.id !== reserva.id));
    }
    setActualizandoId(null);
  }

  async function cambiarEstadoGrupo(reservas: ReservaFila[], nuevoEstado: string) {
    for (const r of reservas) {
      await cambiarEstado(r, nuevoEstado);
    }
  }

  const hoy = toISODate(new Date());

  if (cargando) {
    return (
      <RequireStaff>
        <AdminNav />
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
          <p className="text-sm text-taupe">Cargando operación del día...</p>
        </main>
      </RequireStaff>
    );
  }

  return (
    <RequireStaff>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <h1 className="text-xl font-normal tracking-tight text-negro sm:text-2xl">
          Operación de hoy
        </h1>
        <p className="mt-1 text-sm text-taupe">
          {new Date(`${hoy}T00:00:00`).toLocaleDateString("es-UY", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        {errorEstado && (
          <p className="mt-4 rounded-[3px] border border-chocolate bg-crema px-4 py-2 text-sm text-chocolate">
            {errorEstado}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Seccion titulo="Se va hoy y mañana — tildá cuando retiran" cantidad={retiros.length} verMasHref="/admin/reservas">
            {retiros.length === 0 && <FilaVacia texto="No hay retiros agendados para hoy ni mañana." />}
            {agruparPorClienta(retiros).map((g) => (
              <GrupoClienta
                key={g.clave}
                grupo={g}
                textoTildarTodo="Retiró todo"
                disabled={actualizandoId !== null}
                onTildarTodo={() => cambiarEstadoGrupo(g.reservas, "retirado")}
              >
                {g.reservas.map((r) => {
                  const sinMarcar = r.fecha_retiro < hoy;
                  return (
                    <FilaConCheck
                      key={r.id}
                      titulo={descripcionPrenda(r)}
                      subtitulo={`Retira ${formatFechaCorta(r.fecha_retiro)}`}
                      etiqueta={sinMarcar ? "Sin marcar" : formatFechaCorta(r.fecha_retiro)}
                      etiquetaClass={sinMarcar ? "text-red-700" : "text-chocolate"}
                      checked={false}
                      disabled={actualizandoId === r.id}
                      onToggle={() => cambiarEstado(r, "retirado")}
                    />
                  );
                })}
              </GrupoClienta>
            ))}
          </Seccion>

          <Seccion titulo="Devoluciones pendientes — tildá cuando devuelven" cantidad={devoluciones.length} verMasHref="/admin/reservas">
            {devoluciones.length === 0 && <FilaVacia texto="No hay nada afuera esperando devolución." />}
            {agruparPorClienta(devoluciones).map((g) => (
              <GrupoClienta
                key={g.clave}
                grupo={g}
                textoTildarTodo="Devolvió todo"
                disabled={actualizandoId !== null}
                onTildarTodo={() => cambiarEstadoGrupo(g.reservas, "en_limpieza")}
              >
                {g.reservas.map((r) => {
                  const atrasada = r.fecha_devolucion < hoy;
                  return (
                    <FilaConCheck
                      key={r.id}
                      titulo={descripcionPrenda(r)}
                      subtitulo={`Devuelve ${formatFechaCorta(r.fecha_devolucion)}`}
                      etiqueta={atrasada ? "Atrasada" : formatFechaCorta(r.fecha_devolucion)}
                      etiquetaClass={atrasada ? "text-red-700" : "text-chocolate"}
                      checked={false}
                      disabled={actualizandoId === r.id}
                      onToggle={() => cambiarEstado(r, "en_limpieza")}
                    />
                  );
                })}
              </GrupoClienta>
            ))}
          </Seccion>

          <Seccion titulo="Limpieza — destildá cuando ya está lista" cantidad={limpieza.length} verMasHref="/admin/reservas">
            {limpieza.length === 0 && <FilaVacia texto="No hay nada esperando limpieza." />}
            {agruparPorClienta(limpieza).map((g) => (
              <GrupoClienta
                key={g.clave}
                grupo={g}
                textoTildarTodo="Todo listo"
                disabled={actualizandoId !== null}
                onTildarTodo={() => cambiarEstadoGrupo(g.reservas, "devuelto")}
              >
                {g.reservas.map((r) => (
                  <FilaConCheck
                    key={r.id}
                    titulo={descripcionPrenda(r)}
                    subtitulo="En limpieza"
                    etiqueta="Pendiente"
                    checked={true}
                    disabled={actualizandoId === r.id}
                    onToggle={() => cambiarEstado(r, "devuelto")}
                  />
                ))}
              </GrupoClienta>
            ))}
          </Seccion>

          {verCaja && (
            <Seccion titulo="Pagos pendientes de cobrar" cantidad={pagosPendientes.length} verMasHref="/admin/reservas">
              {pagosPendientes.length === 0 && <FilaVacia texto="No hay saldos pendientes." />}
              {agruparPorClienta(pagosPendientes).map((g) => {
                const totalFalta = g.reservas.reduce(
                  (acc, r) => acc + Number(r.precio_total) - Number(r.senia),
                  0
                );
                return (
                  <GrupoClienta key={g.clave} grupo={g}>
                    {g.reservas.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-5 py-2 text-sm">
                        <p className="text-xs text-taupe">{descripcionPrenda(r)}</p>
                        <span className="whitespace-nowrap text-xs text-taupe">
                          {currencyFormatter.format(Number(r.precio_total) - Number(r.senia))}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-5 py-2 text-sm">
                      <p className="text-xs uppercase tracking-wider text-chocolate">Total a cobrar</p>
                      <span className="whitespace-nowrap text-sm font-medium text-negro">
                        {currencyFormatter.format(totalFalta)}
                      </span>
                    </div>
                  </GrupoClienta>
                );
              })}
            </Seccion>
          )}

          {verModista && (
            <Seccion titulo="Turnos con la modista — hoy" cantidad={turnosHoy.length} verMasHref="/admin/turnos">
              {turnosHoy.length === 0 && <FilaVacia texto="No hay turnos agendados para hoy." />}
              {turnosHoy.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <p className="font-medium text-negro">{t.nombre}</p>
                  <span className="whitespace-nowrap text-xs uppercase tracking-wider text-chocolate">
                    {t.hora}
                  </span>
                </div>
              ))}
            </Seccion>
          )}

          {verModista && (
            <Seccion titulo="Arreglos listos para entregar" cantidad={arreglosListos.length} verMasHref="/admin/arreglos">
              {arreglosListos.length === 0 && <FilaVacia texto="No hay arreglos listos esperando entrega." />}
              {arreglosListos.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-negro">{a.nombre}</p>
                    <p className="text-xs text-taupe">
                      {a.sku} {a.talle ? `· ${a.talle}` : ""} · {a.detalle}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs uppercase tracking-wider text-chocolate">
                    Retira {formatFechaCorta(a.fecha_retiro_clienta)}
                  </span>
                </div>
              ))}
            </Seccion>
          )}

          {verCaja && (
            <Seccion titulo="Pedidos a medida con saldo pendiente" cantidad={cobrosMedida.length} verMasHref="/admin/pedidos-medida">
              {cobrosMedida.length === 0 && <FilaVacia texto="No hay pedidos a medida con saldo pendiente." />}
              {cobrosMedida.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <p className="font-medium text-negro">
                    #{c.numero} · {c.nombre}
                  </p>
                  <span className="whitespace-nowrap text-xs text-negro">
                    {currencyFormatter.format(Number(c.saldo))}
                  </span>
                </div>
              ))}
            </Seccion>
          )}
        </div>

        <h2 className="mt-10 text-sm font-medium uppercase tracking-wider text-taupe">
          Todos los módulos
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-16 items-center justify-center rounded-[3px] border border-arena bg-blanco px-4 text-center text-sm text-negro transition-colors hover:border-chocolate hover:text-chocolate"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </main>
    </RequireStaff>
  );
}
