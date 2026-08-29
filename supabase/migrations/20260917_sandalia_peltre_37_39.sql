-- Môone — Foto y descripción de sandalias altas peltre, talle 37 a 39
--
-- Tono más grisáceo/metalizado oscuro que el plateado brillante de
-- los talles 35/36/40, mismo diseño de tiras cruzadas.

update products set
  foto_url = '/images/sandalias/sandalia-alta-peltre-cruzada.jpg',
  descripcion = 'Sandalia peltre con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia peltre con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, un metalizado grisáceo con onda propia.'
where sku in ('SAN-00015', 'SAN-00021', 'SAN-00027');
