-- Respuestas del formulario "Tu vestido de egreso" (/egresadas, colaboración
-- con Victoria Vidarte). Antes solo se mandaban por mail; esta tabla las deja
-- guardadas para poder verlas listadas desde el backoffice.

create table egresadas_submissions (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  liceo text not null,
  graduacion date not null,
  talle text not null,
  color text not null,
  imagen_path text not null,
  gusta text,
  cambiaria text,
  instagram text not null,
  whatsapp text not null,
  revisado boolean not null default false,
  created_at timestamptz not null default now()
);

alter table egresadas_submissions enable row level security;

-- Sin política de insert: las filas las crea el endpoint público
-- (app/api/egresadas/route.ts) con la service_role key, que ignora RLS.
create policy "solo staff ve las respuestas de egresadas"
  on egresadas_submissions for select
  using (is_staff());

create policy "solo staff marca como revisadas las respuestas de egresadas"
  on egresadas_submissions for update
  using (is_staff())
  with check (is_staff());

-- Bucket privado para las imágenes de inspiración que suben las clientas.
-- No es público: se ven desde el backoffice con un signed URL generado al
-- vuelo (ver app/admin/egresadas/page.tsx), no con una URL pública fija.
insert into storage.buckets (id, name, public)
values ('egresadas', 'egresadas', false)
on conflict (id) do nothing;

create policy "staff lee las imagenes de egresadas"
  on storage.objects for select
  using (bucket_id = 'egresadas' and is_staff());
