-- Número de pedido legible (no el UUID de pedido_id) para que la clienta y
-- el staff puedan identificar un pedido de palabra/por teléfono, buscarlo,
-- y marcarlo entregado al retirar. Se asigna solo (vía trigger) apenas se
-- inserta una reserva, reutilizando el mismo número para todo lo que
-- comparta pedido_id (un pedido con varias prendas = un solo número).
create sequence if not exists pedido_numero_seq start 1;

create or replace function asignar_numero_pedido()
returns trigger
language plpgsql
as $$
begin
  if new.numero_pedido is null then
    if new.pedido_id is not null then
      select numero_pedido into new.numero_pedido
      from reservations
      where pedido_id = new.pedido_id and numero_pedido is not null
      limit 1;
    end if;
    if new.numero_pedido is null then
      new.numero_pedido := nextval('pedido_numero_seq');
    end if;
  end if;
  return new;
end;
$$;

alter table reservations add column if not exists numero_pedido integer;

create trigger trg_asignar_numero_pedido
  before insert on reservations
  for each row
  execute function asignar_numero_pedido();

-- Backfill: un número por cada pedido_id ya existente, en orden de
-- created_at, para que el historial también tenga número.
with pedidos_ordenados as (
  select pedido_id, min(created_at) as primer_created_at
  from reservations
  where pedido_id is not null and numero_pedido is null
  group by pedido_id
  order by primer_created_at
),
numerados as (
  select pedido_id, nextval('pedido_numero_seq') as numero
  from pedidos_ordenados
)
update reservations r
set numero_pedido = n.numero
from numerados n
where r.pedido_id = n.pedido_id and r.numero_pedido is null;

create index if not exists idx_reservations_numero_pedido on reservations(numero_pedido);
