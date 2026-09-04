-- Môone — Vestido bordo de lentejuelas con recorte lateral, en venta
-- definitiva. Diseño único, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00310', 'Vestido largo bordo de lentejuelas con recorte lateral', 'vestido', 'S', 'Bordo', 0, 2100, 'disponible',
   '/images/vestidos/vestido-bordo-lentejuelas-asimetrico.jpg',
   array['/images/vestidos/vestido-bordo-lentejuelas-asimetrico.jpg', '/images/vestidos/vestido-bordo-lentejuelas-asimetrico-espalda.jpg'],
   'Vestido largo bordo de lentejuelas con hombro asimétrico, recorte en la cintura, tajo frontal y espalda descubierta con tiras cruzadas para atar.');
