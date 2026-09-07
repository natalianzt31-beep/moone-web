-- Môone — Documenta email_log, ya existente en producción (creada
-- out-of-band, igual que promo_codes, closed_dates, senia_avisada y
-- saldo_pagado). No cambia nada en la base que ya la tiene (create if
-- not exists): es solo para que un clon nuevo del proyecto tenga la
-- tabla.
--
-- El código ahora sí la usa (lib/email/log.ts, registrarEnvioEmail):
-- cada intento de envío de confirmación de reserva, recordatorio de
-- retiro, e-ticket o promo de carrito abandonado deja una fila acá,
-- con estado_envio 'enviado' o 'error'. reservation_id queda null para
-- los mails que no están atados a una reserva (e-ticket de venta,
-- promos de carrito abandonado).

create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id),
  tipo text not null check (tipo in (
    'confirmacion_reserva', 'recordatorio_retiro', 'eticket',
    'recordatorio_devolucion', 'pedido_resena', 'promocion'
  )),
  destinatario text not null,
  estado_envio text not null default 'pendiente'
    check (estado_envio in ('pendiente', 'enviado', 'error')),
  fecha_envio timestamptz,
  proveedor_msg_id text,
  created_at timestamptz not null default now()
);

-- Sin policies a propósito: solo se escribe/lee con la service role
-- (server-only), nunca con la anon/authenticated key.
alter table email_log enable row level security;
