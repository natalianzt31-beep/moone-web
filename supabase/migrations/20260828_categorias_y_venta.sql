-- Môone — Fase 2: categorías completas + venta de prendas
-- Correr esto en Supabase → SQL Editor

-- La Colección del sitio tiene 5 categorías (vestido, mono, sandalias,
-- cartera, tapado) pero el constraint original solo permitía 3.
alter table products drop constraint products_categoria_check;
alter table products add constraint products_categoria_check
  check (categoria in ('vestido','mono','sandalias','cartera','tapado'));

-- Campos para poner prendas en venta (se cobran al 100%, a diferencia
-- del alquiler que se reserva con el 50% de seña).
alter table products add column en_venta boolean not null default false;
alter table products add column precio_venta numeric;
