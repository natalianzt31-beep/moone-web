-- Môone — Códigos de descuento en el carrito
--
-- Nota: esta tabla y sus políticas ya fueron creadas directamente en
-- Supabase antes de trackearlas acá; este archivo documenta el esquema
-- real para que un clon nuevo del proyecto quede consistente.

create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  descripcion text,
  porcentaje numeric not null,
  requiere_combo boolean not null default false,
  categorias_requeridas text[],
  activo boolean not null default true,
  fecha_inicio date,
  fecha_fin date,
  usos_maximos integer,
  usos_actuales integer not null default 0,
  created_at timestamptz not null default now()
);

alter table promo_codes enable row level security;

create policy "codigos activos son publicos"
  on promo_codes for select
  using (activo = true);

create policy "solo staff gestiona codigos"
  on promo_codes for all
  using (is_staff())
  with check (is_staff());

-- Incrementa usos_actuales al confirmar una reserva con un código aplicado.
-- SECURITY DEFINER porque "solo staff gestiona codigos" bloquearía el update
-- desde una clienta; el incremento atómico evita carreras de select+update.
create or replace function increment_promo_code_uso(p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update promo_codes
  set usos_actuales = usos_actuales + 1
  where lower(codigo) = lower(p_codigo) and activo = true;
end;
$$;

grant execute on function increment_promo_code_uso(text) to authenticated;
