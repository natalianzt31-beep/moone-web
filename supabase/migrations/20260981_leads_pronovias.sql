-- Formulario de contacto para la colaboración Cecilia Méndez — Alta
-- Costura × Pronovias (/pronovias). Es solo captura de datos: la clienta
-- coordina su prueba por WhatsApp directamente con Cecilia Méndez, así que
-- acá no hay agenda ni horarios, solo guardamos el lead para seguimiento.
--
-- No hay política de insert para authenticated/anon: las filas las crea el
-- endpoint público (app/api/pronovias) con la service_role key, que ignora
-- RLS — igual que citas_modista / egresadas_submissions.

create table leads_pronovias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_casamiento_estimada date,
  celular text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table leads_pronovias enable row level security;

create policy "solo staff ve los leads de pronovias"
  on leads_pronovias for select
  using (is_staff());
