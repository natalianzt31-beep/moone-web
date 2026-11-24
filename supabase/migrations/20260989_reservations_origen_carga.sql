-- Distingue cómo se originó cada reserva (admin manual, checkout web,
-- "pagar en el local", o carga histórica a posteriori desde planillas/chat)
-- para poder filtrar la actividad real del día sin que la ensucien las
-- cargas masivas de datos viejos con created_at de hoy.
alter table reservations add column origen text
  check (origen in ('admin', 'web', 'local', 'backfill'));

comment on column reservations.origen is
  'Cómo se creó la reserva: admin (CargarReservaForm), web (checkout/Mercado Pago), local ("pagar en el local" desde la web), backfill (carga histórica a posteriori hecha por Claude desde planillas/chat). NULL en reservas previas a este cambio que no se pudieron clasificar con certeza.';

-- Clasifica retroactivamente las cargas históricas: todas llevan la
-- palabra "Cargado" en notas_internas, campo que ningún flujo real (admin,
-- web, local) completa.
update reservations set origen = 'backfill'
where origen is null and notas_internas ilike '%cargado%';

-- Las 4 reservas que sí se cargaron en vivo desde el admin el 23/11 por la
-- usuaria de ventas (confirmado contra los logs de Supabase/Vercel de ese
-- día), para que la vista de Actividad las pueda mostrar desde ya.
update reservations set origen = 'admin'
where origen is null and id in (
  '53f70539-6942-4a84-b776-5b2943fd566c',
  'fa9afffc-90fd-4baa-89e2-419d5b587848',
  'bc28433b-414e-4a39-967e-372f586461e4',
  '42a207fb-dd66-49fa-a973-bc5d066ae405'
);
