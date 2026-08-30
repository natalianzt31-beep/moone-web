-- Môone — Días que el local no abre (feriados, cierres puntuales)
--
-- Nota: esta tabla y sus políticas ya fueron creadas directamente en
-- Supabase antes de trackearlas acá; este archivo documenta el esquema
-- real para que un clon nuevo del proyecto quede consistente.

create table closed_dates (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,
  motivo text,
  created_at timestamptz not null default now()
);

alter table closed_dates enable row level security;

create policy "dias cerrados son publicos"
  on closed_dates for select
  using (true);

create policy "solo staff gestiona dias cerrados"
  on closed_dates for all
  using (is_staff())
  with check (is_staff());
