-- Permite cargar artículos "en venta" dentro del mismo pedido de alquiler
-- (ej. una clienta retira un vestido alquilado y además compra una capa).
-- Un artículo con tipo='venta' no pasa por el flujo de devolución: se carga
-- directamente con estado 'devuelto' (no requiere más acción) y el producto
-- se da de baja de stock al cargarlo, en vez de quedar bloqueado por fechas.
alter table reservations
  add column if not exists tipo text not null default 'alquiler'
  check (tipo in ('alquiler', 'venta'));

create index if not exists idx_reservations_tipo on reservations(tipo);
