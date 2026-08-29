-- Môone — Corrección definitiva de sandalias altas doradas + carga de
-- sandalias bajas blancas

-- 1. Doradas: 35, 36 y 40 con el diseño de tira ancha (a); 37, 38 y 39
--    con el diseño de tiras cruzadas tono bronce (b). Unifica todo lo
--    que había quedado mezclado de correcciones anteriores.
update products set
  foto_url = '/images/sandalias/sandalia-alta-dorado-a.jpg',
  imagen_2_url = null,
  descripcion = 'Sandalia dorada con tira ancha en la punta, tobillera con presilla y plataforma',
  descripcion_web = 'Sandalia dorada con tira ancha en la punta y tobillera con presilla, sobre plataforma y taco alto grueso, luminosa y cómoda para toda la noche.'
where sku in ('SAN-00004', 'SAN-00010', 'SAN-00034');

update products set
  foto_url = '/images/sandalias/sandalia-alta-dorado-b.jpg',
  imagen_2_url = null,
  descripcion = 'Sandalia dorada bronce con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia dorada en tono bronce con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, un dorado envejecido con mucho carácter.'
where sku in ('SAN-00016', 'SAN-00022', 'SAN-00028');

-- 2. Sandalias bajas blancas, talle 35 a 40: taco bajo grueso, tira
--    simple en la punta y tobillera con hebilla.
update products set
  foto_url = '/images/sandalias/sandalia-baja-blanco.jpg',
  descripcion = 'Sandalia baja blanca con tira simple en la punta y tobillera con hebilla',
  descripcion_web = 'Sandalia baja blanca con tira simple en la punta y tobillera con hebilla, sobre taco bajo grueso, cómoda para usar de tarde o de noche.'
where sku in ('SAN-00037', 'SAN-00042', 'SAN-00047', 'SAN-00052', 'SAN-00057', 'SAN-00062');
