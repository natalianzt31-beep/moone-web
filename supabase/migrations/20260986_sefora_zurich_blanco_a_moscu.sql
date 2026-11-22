-- Môone — Séfora Lencería: el "Conjunto Zurich" blanco talle 90 (SEF-00063)
-- pasa a llamarse "Conjunto Moscú" y su precio a $1990.

update products
set nombre = 'Conjunto Moscú',
    precio_venta = 1990,
    grupo_producto = 'sefora-conjunto-moscu-blanco',
    slug = 'sefora-conjunto-moscu-blanco'
where marca = 'Séfora Lencería' and nombre = 'Conjunto Zurich' and color = 'Blanco' and talle = '90';
