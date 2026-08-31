-- Môone — Foto y descripción de sandalia baja negra (35-40, no tenía foto)
-- y reemplazo de foto de sandalia alta blanca (35-40)

update products set
  foto_url = '/images/sandalias/sandalia-baja-negro.jpg',
  descripcion = 'Sandalia baja negra con tiras finas cruzadas y tobillera con hebilla',
  descripcion_web = 'Sandalia baja negra con tiras finas cruzadas en la punta y tobillera con hebilla, sobre taco bajo grueso, cómoda y versátil para el día o la noche.'
where sku in ('SAN-00038', 'SAN-00043', 'SAN-00048', 'SAN-00053', 'SAN-00058', 'SAN-00063');

update products set
  foto_url = '/images/sandalias/sandalia-alta-blanco-plataforma.jpg',
  descripcion = 'Sandalia blanca con tiras cruzadas en la punta, plataforma y taco alto grueso',
  descripcion_web = 'Sandalia blanca con tiras cruzadas en la punta, sobre plataforma y taco alto grueso, un clásico luminoso para looks de fiesta.'
where sku in ('SAN-00001', 'SAN-00007', 'SAN-00013', 'SAN-00019', 'SAN-00025', 'SAN-00031');
