-- Môone — Documenta products.condicion (Nuevo/Usado), ya existente en
-- producción (creada fuera de las migraciones, igual que promo_codes,
-- closed_dates y senia_avisada). No se aplica nada acá: es solo para que
-- un clon nuevo del proyecto tenga la columna.
--
-- Reglas de negocio (aplicadas en /admin/stock y en el catálogo, no acá):
--   - Solo se pide/edita cuando el producto tiene precio_venta cargado.
--   - El badge "Nuevo"/"Usado" solo se muestra en /sale y en la ficha de
--     esos productos (tipo="venta"), nunca en el catálogo de alquiler.

alter table products add column if not exists condicion text;
