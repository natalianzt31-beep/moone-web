-- Môone — payments admite pagos de venta definitiva (sin reserva)
--
-- Las compras (venta definitiva) se pagan 100% de una vez, sin fechas de
-- retiro/devolución ni fila en reservations. payments pasa a admitir dos
-- formas: seña de alquiler (reservation_id) o venta directa (product_id +
-- client_id), nunca una mezcla de ambas.

alter table payments alter column reservation_id drop not null;
alter table payments add column if not exists product_id uuid references products(id);
alter table payments add column if not exists client_id uuid references clients(id);

alter table payments add constraint payments_reserva_o_venta_check
  check (
    (reservation_id is not null and product_id is null and client_id is null)
    or
    (reservation_id is null and product_id is not null and client_id is not null)
  );

drop policy "una clienta ve los pagos de sus reservas" on payments;

create policy "una clienta ve sus pagos"
  on payments for select
  using (
    (reservation_id is not null and reservation_id in (
      select id from reservations where client_id in (
        select id from clients where auth_user_id = auth.uid()
      )
    ))
    or
    (client_id is not null and client_id in (
      select id from clients where auth_user_id = auth.uid()
    ))
  );
