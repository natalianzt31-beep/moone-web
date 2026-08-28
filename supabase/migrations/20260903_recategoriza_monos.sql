-- Môone — Recategoriza los monos que habían quedado cargados como vestido
--
-- 11 productos con nombre "Mono ..." tenían categoria = 'vestido' (probablemente
-- del import original del catálogo), así que aparecían mezclados en la
-- categoría Vestidos en vez de tener su propia sección Monos.

update products set categoria = 'mono' where categoria = 'vestido' and nombre ilike 'mono %';
