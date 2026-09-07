-- Môone — el sellito de fidelidad se sumaba al marcar una reserva como
-- "devuelto" desde /admin/reservas, un estado logístico desconectado de
-- si el alquiler ya se facturó. Ahora se suma automáticamente cuando se
-- factura el alquiler (al marcar el saldo pagado), no antes.
--
-- Nueva función de uso exclusivo del backend (service_role): sin el
-- chequeo de is_staff() porque el caller es código de servidor, no una
-- sesión de staff con auth.uid(). Se revoca el permiso de ejecución a
-- anon/authenticated para que solo el service_role pueda invocarla.
create or replace function increment_alquileres_completados_sistema(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update clients
  set alquileres_completados = alquileres_completados + 1
  where id = p_client_id;
end;
$$;

revoke execute on function increment_alquileres_completados_sistema(uuid) from public, anon, authenticated;
grant execute on function increment_alquileres_completados_sistema(uuid) to service_role;
