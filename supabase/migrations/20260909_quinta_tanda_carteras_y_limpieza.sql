-- Môone — quinta tanda de carteras + limpieza de placeholders + foto de sandalia

-- 1. Dos carteras nuevas con foto real.
insert into products (sku, nombre, categoria, color, precio_alquiler, foto_url, descripcion, descripcion_web)
values
  ('CAR-00030', 'Cartera roja de gamuza con broche en V', 'cartera', 'Rojo', 290,
   '/images/carteras/cartera-roja-gamuza.jpg',
   'Cartera cilíndrica roja de gamuza con costura diagonal y broche metálico en V',
   'Cartera cilíndrica de gamuza roja, con costura diagonal y broche metálico dorado en V, un statement de color para una noche de fiesta.'),

  ('CAR-00031', 'Cartera dorada texturizada con manija', 'cartera', 'Dorado', 290,
   '/images/carteras/cartera-dorada-textura-manija.jpg',
   'Cartera dorada de textura tipo bouclé con manija superior y solapa',
   'Cartera dorada de textura tipo bouclé con destellos, manija superior redonda y solapa, un brillo sutil y elegante para cualquier evento.');

-- 2. Se quitan las 10 carteras placeholder "Sobre de fiesta" que nunca
--    tuvieron foto real (CAR-00001 a CAR-00010) ahora que la categoría
--    ya tiene piezas reales cargadas.
delete from products where categoria = 'cartera' and foto_url is null;

-- 3. La sandalia dorada talle 35 recibida es "alta" (plataforma + taco
--    grueso), así que va en el placeholder que ya existía para eso
--    (SAN-00004), no como producto nuevo.
update products set
  foto_url = '/images/sandalias/sandalia-alta-dorado-35.jpg',
  imagen_2_url = '/images/sandalias/sandalia-alta-dorado-35-frente.jpg'
where sku = 'SAN-00004';
