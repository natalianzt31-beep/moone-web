-- Môone — Fotos y descripción de sandalias altas plateadas (35/36/40,
-- color "Peltre" en el catálogo) y blancas (35 a 40)

update products set
  foto_url = '/images/sandalias/sandalia-alta-plateado-cruzada.jpg',
  imagen_2_url = '/images/sandalias/sandalia-alta-plateado-cruzada-perfil.jpg',
  descripcion = 'Sandalia plateada con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia plateada con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, cómoda para bailar toda la noche.'
where sku in ('SAN-00003', 'SAN-00009', 'SAN-00033');

update products set
  foto_url = '/images/sandalias/sandalia-alta-blanco-cruzada.jpg',
  descripcion = 'Sandalia blanca con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia blanca con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, ideal para un look claro y versátil.'
where sku in ('SAN-00001', 'SAN-00007', 'SAN-00013', 'SAN-00019', 'SAN-00025', 'SAN-00031');
