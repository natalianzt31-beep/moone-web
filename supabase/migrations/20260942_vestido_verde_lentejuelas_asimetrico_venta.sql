-- Môone — Vestido verde de lentejuelas con recorte lateral, en venta
-- definitiva. Diseño único, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00298', 'Vestido largo verde de lentejuelas con recorte lateral', 'vestido', 'S', 'Verde', 0, 2100, 'disponible',
   '/images/vestidos/vestido-verde-lentejuelas-asimetrico.jpg',
   array['/images/vestidos/vestido-verde-lentejuelas-asimetrico.jpg', '/images/vestidos/vestido-verde-lentejuelas-asimetrico-espalda.jpg'],
   'Vestido largo verde bosque de lentejuelas con hombro asimétrico, recorte en la cintura, tajo frontal y espalda descubierta con tiras cruzadas para atar.');
