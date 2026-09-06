-- Môone — Vestido plateado asimétrico con cutout en la cintura, en venta
-- definitiva. Mismo diseño en talles S y M, agrupado con grupo_producto
-- para mostrar un selector de talle en el catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00321', 'Vestido plateado asimétrico con cutout en la cintura', 'vestido', 'S', 'Plateado', 0, 1600, 'disponible',
   '/images/vestidos/vestido-plateado-asimetrico-cutout.jpg',
   array['/images/vestidos/vestido-plateado-asimetrico-cutout.jpg', '/images/vestidos/vestido-plateado-asimetrico-cutout-espalda.jpg'],
   'Vestido plateado metalizado a un hombro con argolla decorativa, cutout en la cintura y falda drapeada asimétrica con tajo.',
   'vestido-plateado-asimetrico-cutout'),

  ('VES-00322', 'Vestido plateado asimétrico con cutout en la cintura', 'vestido', 'M', 'Plateado', 0, 1600, 'disponible',
   '/images/vestidos/vestido-plateado-asimetrico-cutout.jpg',
   array['/images/vestidos/vestido-plateado-asimetrico-cutout.jpg', '/images/vestidos/vestido-plateado-asimetrico-cutout-espalda.jpg'],
   'Vestido plateado metalizado a un hombro con argolla decorativa, cutout en la cintura y falda drapeada asimétrica con tajo.',
   'vestido-plateado-asimetrico-cutout');
