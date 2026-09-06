-- Môone — Vestido bronce metalizado asimétrico con cutout en la cintura,
-- en venta definitiva. Mismo diseño en talles S, M y L, agrupado con
-- grupo_producto para mostrar un selector de talle en el catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00323', 'Vestido bronce asimétrico con cutout en la cintura', 'vestido', 'S', 'Bronce', 0, 1600, 'disponible',
   '/images/vestidos/vestido-bronce-asimetrico-cutout.jpg',
   array['/images/vestidos/vestido-bronce-asimetrico-cutout.jpg', '/images/vestidos/vestido-bronce-asimetrico-cutout-espalda.jpg'],
   'Vestido bronce metalizado a un hombro con argolla decorativa, cutout en la cintura y falda drapeada asimétrica con tajo.',
   'vestido-bronce-asimetrico-cutout'),

  ('VES-00324', 'Vestido bronce asimétrico con cutout en la cintura', 'vestido', 'M', 'Bronce', 0, 1600, 'disponible',
   '/images/vestidos/vestido-bronce-asimetrico-cutout.jpg',
   array['/images/vestidos/vestido-bronce-asimetrico-cutout.jpg', '/images/vestidos/vestido-bronce-asimetrico-cutout-espalda.jpg'],
   'Vestido bronce metalizado a un hombro con argolla decorativa, cutout en la cintura y falda drapeada asimétrica con tajo.',
   'vestido-bronce-asimetrico-cutout'),

  ('VES-00325', 'Vestido bronce asimétrico con cutout en la cintura', 'vestido', 'L', 'Bronce', 0, 1600, 'disponible',
   '/images/vestidos/vestido-bronce-asimetrico-cutout.jpg',
   array['/images/vestidos/vestido-bronce-asimetrico-cutout.jpg', '/images/vestidos/vestido-bronce-asimetrico-cutout-espalda.jpg'],
   'Vestido bronce metalizado a un hombro con argolla decorativa, cutout en la cintura y falda drapeada asimétrica con tajo.',
   'vestido-bronce-asimetrico-cutout');
