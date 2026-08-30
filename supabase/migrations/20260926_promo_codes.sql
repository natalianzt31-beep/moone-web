-- Môone — Códigos de descuento en el carrito

create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  porcentaje numeric not null check (porcentaje > 0 and porcentaje <= 100),
  activo boolean not null default true,
  requiere_combo boolean not null default false,
  categorias_requeridas text[] not null default '{}',
  fecha_inicio date,
  fecha_fin date,
  usos_maximos integer,
  usos_actuales integer not null default 0,
  created_at timestamptz not null default now()
);

-- Case-insensitive: "VESTIDOSAND" y "vestidosand" son el mismo código.
create unique index idx_promo_codes_codigo_lower on promo_codes (lower(codigo));

alter table promo_codes enable row level security;

-- Solo clientas logueadas pueden consultar los códigos (se validan en el carrito).
create policy "clientas autenticadas leen promo_codes"
  on promo_codes for select
  using (auth.uid() is not null);

create or replace function increment_promo_code_uso(p_codigo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autorizado';
  end if;

  update promo_codes
  set usos_actuales = usos_actuales + 1
  where lower(codigo) = lower(p_codigo) and activo = true;
end;
$$;

grant execute on function increment_promo_code_uso(text) to authenticated;
