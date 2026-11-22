-- Môone — Séfora Lencería: el "Conjunto Turquia" color Nougat pasa a llamarse
-- "Conjunto Jasmín" (mismo SKU, SEF-00052).

update products
set nombre = 'Conjunto Jasmín',
    grupo_producto = 'sefora-conjunto-jasmin-nougat',
    slug = 'sefora-conjunto-jasmin-nougat'
where marca = 'Séfora Lencería' and nombre = 'Conjunto Turquia' and color = 'Nougat';
