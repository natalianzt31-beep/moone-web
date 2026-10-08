-- Agenda de turnos con la modista (/turnos). Las clientas reservan un
-- horario fijo (viernes 14-18, sábado 10-18, cada 30 min) contando la
-- fecha de su fiesta y adjuntando una foto del vestido que quieren lograr.
-- Se manda confirmación por mail con un link de baja (token).
--
-- No hay política de insert/delete para authenticated/anon: las filas las
-- crea y cancela el endpoint público (app/api/citas/*) con la
-- service_role key, que ignora RLS — igual que egresadas_submissions.

create table citas_modista (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora text not null check (hora ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'),
  nombre text not null,
  email text not null,
  celular text not null,
  fecha_fiesta date not null,
  imagen_path text not null,
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  token uuid not null default gen_random_uuid(),
  cancelado_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index citas_modista_token_key on citas_modista (token);

-- Un mismo horario no puede tener dos turnos confirmados a la vez
-- (los cancelados liberan el horario).
create unique index citas_modista_slot_activo
  on citas_modista (fecha, hora)
  where estado = 'confirmada';

alter table citas_modista enable row level security;

create policy "solo staff ve los turnos"
  on citas_modista for select
  using (is_staff());

create policy "solo staff actualiza turnos"
  on citas_modista for update
  using (is_staff())
  with check (is_staff());

-- Bucket privado para las fotos de inspiración que suben las clientas al
-- agendarse. Se ven desde el backoffice con un signed URL generado al
-- vuelo (igual que el bucket "egresadas").
insert into storage.buckets (id, name, public)
values ('citas-modista', 'citas-modista', false)
on conflict (id) do nothing;

create policy "staff lee las imagenes de citas"
  on storage.objects for select
  using (bucket_id = 'citas-modista' and is_staff());
