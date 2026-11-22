-- Môone — eventos del módulo "Completá tu look" (venta cruzada), para
-- medir si las recomendaciones aumentan artículos por reserva y ticket.

create table if not exists recomendacion_eventos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  client_id uuid references clients(id) on delete set null,
  evento text not null check (evento in ('mostrada', 'click', 'agregada')),
  origen text not null check (origen in ('ficha', 'post_agregar', 'carrito')),
  producto_base_id uuid references products(id) on delete set null,
  producto_id uuid references products(id) on delete set null,
  cantidad integer not null default 1
);

create index if not exists idx_reco_eventos_created_at on recomendacion_eventos(created_at);
create index if not exists idx_reco_eventos_client on recomendacion_eventos(client_id, producto_id)
  where evento = 'agregada';

alter table recomendacion_eventos enable row level security;
create policy "staff ve los eventos de recomendaciones"
  on recomendacion_eventos for select
  using (is_staff());
-- Los inserts se hacen server-side con la service role key (ver
-- app/api/track-recomendacion), igual que page_views.
