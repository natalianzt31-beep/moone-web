-- Môone — Reemplaza foto y descripción de sandalias altas doradas
-- talle 35, 36 y 40 con el nuevo modelo (tira ancha, no cruzada, con
-- tobillera de presilla). SAN-00004 (talle 35) ya tenía una foto de
-- otro diseño (tiras cruzadas); se reemplaza según lo pedido, y se
-- limpia imagen_2_url porque esa segunda foto correspondía al diseño
-- anterior.

update products set
  foto_url = '/images/sandalias/sandalia-alta-dorado-simple.jpg',
  imagen_2_url = null,
  descripcion = 'Sandalia dorada con tira ancha en la punta, tobillera con presilla y plataforma',
  descripcion_web = 'Sandalia dorada con tira ancha en la punta y tobillera con presilla, sobre plataforma y taco alto grueso, luminosa y cómoda para toda la noche.'
where sku in ('SAN-00004', 'SAN-00010', 'SAN-00034');
