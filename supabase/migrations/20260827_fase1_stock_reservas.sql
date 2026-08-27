-- Môone — Fase 1: Stock y Reservas
-- Correr esto en Supabase → SQL Editor

-- Extensión necesaria para el constraint de rango de fechas
create extension if not exists btree_gist;

-- Tabla de productos
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  nombre text not null,
  categoria text not null check (categoria in ('vestido','sandalias','cartera')),
  talle text,
  color text,
  precio_alquiler numeric not null default 0,
  valor_reposicion numeric default 0,
  estado text not null default 'disponible'
    check (estado in ('disponible','reservado','alquilado','en_reparacion','baja_definitiva')),
  foto_url text,
  created_at timestamptz not null default now()
);

-- Tabla de clientes
create table clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  celular text unique not null,
  email text,
  documento text,
  consiente_promos boolean not null default true,
  notas text,
  created_at timestamptz not null default now()
);

-- Tabla de reservas, con bloqueo automático de solapamiento de fechas
create table reservations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  client_id uuid not null references clients(id),
  fecha_retiro date not null,
  fecha_devolucion date not null generated always as (fecha_retiro + 4) stored,
  estado text not null default 'reservado'
    check (estado in ('reservado','confirmado_retiro','retirado','devuelto','vencido','cancelado')),
  precio_total numeric not null default 0,
  senia numeric not null default 0,
  deposito_garantia numeric default 0,
  contrato_aceptado boolean not null default false,
  created_at timestamptz not null default now(),

  -- Esto es lo que impide dos reservas solapadas para el mismo producto
  exclude using gist (
    product_id with =,
    daterange(fecha_retiro, fecha_devolucion, '[]') with &&
  ) where (estado not in ('cancelado','devuelto'))
);

-- Índices útiles para las vistas de "sale hoy" / "vuelve hoy"
create index idx_reservations_fecha_retiro on reservations(fecha_retiro);
create index idx_reservations_fecha_devolucion on reservations(fecha_devolucion);
create index idx_products_estado on products(estado);
