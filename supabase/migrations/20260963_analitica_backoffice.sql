-- Môone — analítica de backoffice: visitas del sitio y seguimiento de
-- carritos abandonados.

create table page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  created_at timestamptz not null default now()
);
create index idx_page_views_created_at on page_views(created_at);
create index idx_page_views_session_id on page_views(session_id);

alter table page_views enable row level security;
create policy "staff ve las visitas"
  on page_views for select
  using (is_staff());
-- Los inserts se hacen server-side con la service role key (bypassa RLS);
-- no hace falta política de insert para anon/authenticated.

-- Hoy carts/cart_items solo dejan pasar a la clienta dueña; la vendedora
-- necesita poder ver todos los carritos para detectar los abandonados.
create policy "staff ve todos los carritos"
  on carts for select
  using (is_staff());
create policy "staff ve todos los items de carrito"
  on cart_items for select
  using (is_staff());

-- Para no mandar el recordatorio de carrito abandonado más de una vez.
alter table cart_items add column if not exists recordatorio_enviado_at timestamptz;
