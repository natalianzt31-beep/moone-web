-- Môone — Checkout Pro de Mercado Pago (seña de reservas)

-- fecha_devolucion arrancó como columna generada (fecha_retiro + 4 fijo);
-- la lógica de negocio hoy la calcula la app respetando domingos y
-- feriados de closed_dates, así que necesita ser una columna normal
-- escribible. DROP EXPRESSION IF EXISTS es un no-op si ya se convirtió
-- a mano en algún ambiente.
alter table reservations alter column fecha_devolucion drop expression if exists;

-- Antes solo staff insertaba reservas desde /admin/reservas. Ahora una
-- clienta puede crear su propia reserva al pagar la seña con Mercado Pago.
create policy "una clienta crea su propia reserva"
  on reservations for insert
  with check (client_id in (select id from clients where auth_user_id = auth.uid()));

alter table reservations add column senia_confirmada boolean not null default false;

create table payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  medio text not null check (medio in ('efectivo', 'transferencia', 'mercado_pago', 'tarjeta', 'otro')),
  tipo text not null check (tipo in ('seña', 'saldo', 'venta')),
  monto numeric not null,
  mp_payment_id text unique,
  created_at timestamptz not null default now()
);

create index idx_payments_reservation_id on payments(reservation_id);

alter table payments enable row level security;

create policy "una clienta ve los pagos de sus reservas"
  on payments for select
  using (
    reservation_id in (
      select id from reservations where client_id in (
        select id from clients where auth_user_id = auth.uid()
      )
    )
  );

create policy "solo staff gestiona pagos"
  on payments for all
  using (is_staff())
  with check (is_staff());
