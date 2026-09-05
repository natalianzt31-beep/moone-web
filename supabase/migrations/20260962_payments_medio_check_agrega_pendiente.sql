-- Môone — payments_medio_check no permitía 'pendiente', el valor que usa
-- el pago pendiente creado por /api/ventas/crear-pedido-local al elegir
-- "Pagar en el local" para una venta. Esto rompía ese flujo en producción
-- con el error "violates check constraint payments_medio_check".
alter table payments drop constraint payments_medio_check;
alter table payments add constraint payments_medio_check
  check (medio = any (array['efectivo','transferencia','mercado_pago','tarjeta','otro','pendiente']));
