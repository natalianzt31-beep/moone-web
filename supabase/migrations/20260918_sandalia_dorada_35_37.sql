-- Môone — Reemplaza foto y descripción de sandalias altas doradas
-- talle 35, 36 y 37 con este modelo (tiras cruzadas, tono dorado
-- bronce/envejecido). La 35 y 36 tenían el diseño de tira ancha; la
-- 37 tenía el dorado brillante de tiras cruzadas — se reemplazan
-- según lo pedido y se limpia imagen_2_url de la 37 porque
-- correspondía a esa foto anterior.

update products set
  foto_url = '/images/sandalias/sandalia-alta-dorado-bronce-cruzada.jpg',
  imagen_2_url = null,
  descripcion = 'Sandalia dorada bronce con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia dorada en tono bronce con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, un dorado envejecido con mucho carácter.'
where sku in ('SAN-00004', 'SAN-00010', 'SAN-00016');
