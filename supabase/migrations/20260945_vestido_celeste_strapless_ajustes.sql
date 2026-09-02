-- Môone — VES-00300: se reemplazan las fotos por otras del mismo vestido
-- (mismo nombre de archivo, no requiere cambio de foto_url/fotos) y se
-- quita la palabra "joya" del nombre del producto.

update products
set nombre = 'Vestido corto celeste strapless con broche'
where sku = 'VES-00300';
