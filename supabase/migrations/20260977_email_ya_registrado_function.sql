-- Permite chequear desde el server (con la service_role key) si un email ya
-- tiene una cuenta confirmada, sin exponer el schema auth completo vía API.
-- Solo se le da permiso a service_role: nunca es invocable desde el navegador
-- (ni con la anon key ni con la sesión de una clienta), para no habilitar
-- un vector de enumeración de emails registrados.
create or replace function public.email_ya_registrado(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users
    where email = lower(p_email)
    and email_confirmed_at is not null
  );
$$;

revoke all on function public.email_ya_registrado(text) from public;
revoke all on function public.email_ya_registrado(text) from anon, authenticated;
grant execute on function public.email_ya_registrado(text) to service_role;

-- Nuevo tipo de email transaccional: aviso de "ya tenés una cuenta" cuando
-- alguien intenta registrarse con un mail ya confirmado.
alter table email_log drop constraint email_log_tipo_check;
alter table email_log add constraint email_log_tipo_check
  check (tipo = any (array[
    'confirmacion_reserva',
    'recordatorio_retiro',
    'eticket',
    'recordatorio_devolucion',
    'pedido_resena',
    'promocion',
    'cuenta_existente'
  ]));
