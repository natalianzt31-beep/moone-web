-- Môone — Fase 3: cuentas de clientas (mi-cuenta)
-- Correr esto en Supabase → SQL Editor

-- 1. Vincular clients con Supabase Auth ---------------------------------

alter table clients add column auth_user_id uuid unique references auth.users(id);
create index idx_clients_auth_user_id on clients(auth_user_id);

-- 2. Carrito -------------------------------------------------------------

create table carts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  tipo text not null default 'alquiler' check (tipo in ('alquiler', 'venta')),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, tipo)
);

create index idx_cart_items_cart_id on cart_items(cart_id);

-- 3. Row Level Security ---------------------------------------------------
-- Antes de esto, cualquiera con la publishable key podía leer (y escribir)
-- todas las filas de estas tablas. De acá en más, cada clienta solo ve lo
-- suyo; products queda de lectura pública (así funciona el catálogo) pero
-- ya no se puede escribir con la key pública.

alter table products enable row level security;
create policy "products son públicos para lectura"
  on products for select
  using (true);

alter table clients enable row level security;
create policy "una clienta ve su propia fila"
  on clients for select
  using (auth_user_id = auth.uid());
create policy "una clienta crea su propia fila al registrarse"
  on clients for insert
  with check (auth_user_id = auth.uid());
create policy "una clienta edita su propia fila"
  on clients for update
  using (auth_user_id = auth.uid());

alter table reservations enable row level security;
create policy "una clienta ve sus propias reservas"
  on reservations for select
  using (
    client_id in (select id from clients where auth_user_id = auth.uid())
  );

alter table carts enable row level security;
create policy "una clienta administra su propio carrito"
  on carts for all
  using (client_id in (select id from clients where auth_user_id = auth.uid()))
  with check (client_id in (select id from clients where auth_user_id = auth.uid()));

alter table cart_items enable row level security;
create policy "una clienta administra los items de su carrito"
  on cart_items for all
  using (
    cart_id in (
      select id from carts where client_id in (
        select id from clients where auth_user_id = auth.uid()
      )
    )
  )
  with check (
    cart_id in (
      select id from carts where client_id in (
        select id from clients where auth_user_id = auth.uid()
      )
    )
  );
