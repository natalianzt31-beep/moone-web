-- Môone — Agrupa las 4 unidades del vestido plateado en venta definitiva
-- (S x2, M, L) en una sola tarjeta con selector de talle en /sale, mismo
-- mecanismo que sandalias y tapado.

update products
set grupo_producto = 'vestido-plateado-corset-tajo'
where sku in ('VES-00269', 'VES-00270', 'VES-00271', 'VES-00272');
