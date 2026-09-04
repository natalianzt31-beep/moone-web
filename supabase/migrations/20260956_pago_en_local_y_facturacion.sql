-- Môone — soporte para "pagar en el local" (efectivo/transferencia/POS) y
-- facturación automática con Memory Gestión (e-ticket).
--
-- payments.confirmado: false = pago pendiente, cargado cuando la clienta elige
-- "pagar en el local" al reservar/comprar; la vendedora lo confirma desde el
-- backoffice una vez que recibe el pago (efectivo/transferencia/POS), momento
-- en el que se completa la operación (reserva/venta). Los pagos ya existentes
-- (Mercado Pago vía webhook) son pagos reales: confirmado=true por defecto.
alter table payments add column if not exists confirmado boolean not null default true;

-- Registro de facturación (e-ticket de Memory Gestión) para pagos de venta.
alter table payments add column if not exists eticket_generado boolean not null default false;
alter table payments add column if not exists eticket_url text;
alter table payments add column if not exists eticket_numero text;

-- reservations.eticket_generado/eticket_url ya existían en producción (creadas
-- fuera de las migraciones, mismo patrón que otras columnas de este proyecto).
-- Se documentan acá y se agrega eticket_numero para el mismo fin. Se facturan
-- al final del alquiler (cuando se marca el saldo como pagado), no en la seña.
alter table reservations add column if not exists eticket_generado boolean not null default false;
alter table reservations add column if not exists eticket_url text;
alter table reservations add column if not exists eticket_numero text;
