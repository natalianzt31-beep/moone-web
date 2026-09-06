-- Môone — para no mandar el recordatorio de retiro (con el link de pago
-- del saldo) más de una vez por reserva.
alter table reservations add column if not exists recordatorio_retiro_enviado_at timestamptz;
