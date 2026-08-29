-- Môone — Actualiza foto de sandalias altas plateadas (Peltre) talle
-- 35, 36 y 40 con una nueva toma del mismo diseño (tiras cruzadas).
-- La foto anterior queda como segunda imagen en vez de descartarla.

update products set
  foto_url = '/images/sandalias/sandalia-alta-plateado-cruzada-v2.jpg',
  imagen_2_url = '/images/sandalias/sandalia-alta-plateado-cruzada.jpg',
  descripcion = 'Sandalia plateada con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia plateada con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, un brillo metálico que combina con todo.'
where sku in ('SAN-00003', 'SAN-00009', 'SAN-00033');
