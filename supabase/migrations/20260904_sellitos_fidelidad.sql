-- Môone — Sistema de sellitos digital
--
-- clients.alquileres_completados ya existía (default 0). Esta función
-- la incrementa de forma atómica cuando una reserva pasa a "devuelto"
-- desde /admin/reservas. Es SECURITY DEFINER porque la política de
-- UPDATE de `clients` ya permite is_staff(), pero un incremento atómico
-- (columna = columna + 1) evita condiciones de carrera frente a hacer
-- un select + update desde el cliente.

create or replace function increment_alquileres_completados(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_staff() then
    raise exception 'No autorizado';
  end if;

  update clients
  set alquileres_completados = alquileres_completados + 1
  where id = p_client_id;
end;
$$;
