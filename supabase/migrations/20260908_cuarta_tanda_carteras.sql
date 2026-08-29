-- Môone — 4 carteras más con foto real (cuarta tanda). La 5ta imagen
-- recibida era un duplicado exacto (mismo archivo) del clutch triangular
-- de strass plateado ya cargado como CAR-00025, así que no se repite.

insert into products (sku, nombre, categoria, color, precio_alquiler, foto_url, descripcion, descripcion_web)
values
  ('CAR-00026', 'Cartera bicolor dorado y plata con broche curvo', 'cartera', 'Dorado/Plateado', 290,
   '/images/carteras/cartera-bicolor-dorado-plata.jpg',
   'Cartera cilíndrica bicolor, mitad dorada texturada y mitad plateada lisa, con broche metálico curvo',
   'Cartera cilíndrica bicolor, con un lado en textura dorada brillante y el otro en cuero plateado liso, unidos por un broche metálico curvo, una pieza con carácter propio.'),

  ('CAR-00027', 'Clutch plisado dorado', 'cartera', 'Dorado', 290,
   '/images/carteras/clutch-plisado-dorado.jpg',
   'Clutch plisado dorado con broche metálico',
   'Clutch rectangular en tela dorada plisada con brillo, cerrado con un broche metálico a lo ancho, luminoso y clásico a la vez.'),

  ('CAR-00028', 'Cartera verde esmeralda de terciopelo con broche en V', 'cartera', 'Verde esmeralda', 290,
   '/images/carteras/cartera-verde-terciopelo.jpg',
   'Cartera cilíndrica de terciopelo verde esmeralda con costura diagonal y broche metálico en V',
   'Cartera cilíndrica de terciopelo verde esmeralda, con costura diagonal y broche metálico dorado en V, la versión color de nuestro diseño más statement.'),

  ('CAR-00029', 'Cartera blanca perlada con manija y broche dorado', 'cartera', 'Blanco', 290,
   '/images/carteras/cartera-blanca-perlada.jpg',
   'Cartera blanca perlada con manija superior, solapa y broche dorado triangular',
   'Cartera blanca perlada de silueta trapezoidal, con manija superior redonda, solapa y broche dorado triangular, ideal para una boda o evento diurno.');
