-- Agenda de turnos para el evento especial del 13/11/2026: Cecilia Méndez
-- (Alta Costura) prueba vestidos Pronovias en el atelier de Victoria Vidarte
-- en Môone. Turnos de 1 hora, de 13 a 20hs (un cupo por hora). Esquema
-- análogo a citas_modista, pero sin foto de referencia ni fecha de fiesta.
--
-- No hay política de insert/delete para authenticated/anon: las filas las
-- crea el endpoint público (app/api/evento-cecilia-mendez) con la
-- service_role key, que ignora RLS — igual que citas_modista.

create table citas_cecilia_mendez (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora text not null check (hora ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'),
  nombre text not null,
  email text not null,
  celular text not null,
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  token uuid not null default gen_random_uuid(),
  cancelado_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index citas_cecilia_mendez_token_key on citas_cecilia_mendez (token);

-- Un mismo horario no puede tener dos turnos confirmados a la vez
-- (los cancelados liberan el horario).
create unique index citas_cecilia_mendez_slot_activo
  on citas_cecilia_mendez (fecha, hora)
  where estado = 'confirmada';

alter table citas_cecilia_mendez enable row level security;

create policy "solo staff ve los turnos del evento"
  on citas_cecilia_mendez for select
  using (is_staff());

create policy "solo staff actualiza turnos del evento"
  on citas_cecilia_mendez for update
  using (is_staff())
  with check (is_staff());
