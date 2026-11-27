-- Fecha en que la vendedora cargó el N° de factura de Memory para el
-- pedido (reutilizamos reservations.eticket_numero como el N° de factura
-- externo y reservations.eticket_generado queda intacto para el flujo de
-- e-ticket automático, que es otra cosa). Sirve para filtrar "facturas ya
-- hechas del mes" sin depender de fecha_retiro.
alter table reservations
  add column if not exists facturada_at timestamptz;

create index if not exists idx_reservations_facturada_at on reservations(facturada_at);
