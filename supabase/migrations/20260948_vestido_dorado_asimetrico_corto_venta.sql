-- Môone — Vestido corto dorado asimétrico con espalda descubierta, en
-- venta definitiva. Mismo diseño en talles S, M y L, agrupado con
-- grupo_producto para mostrar un selector de talle en el catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00303', 'Vestido corto dorado asimétrico con espalda descubierta', 'vestido', 'S', 'Dorado', 0, 1000, 'disponible',
   '/images/vestidos/vestido-dorado-asimetrico-corto.jpg',
   array['/images/vestidos/vestido-dorado-asimetrico-corto.jpg', '/images/vestidos/vestido-dorado-asimetrico-corto-espalda.jpg'],
   'Vestido corto dorado metalizado con un solo hombro, silueta entallada y espalda descubierta con hebilla decorativa.',
   'vestido-dorado-asimetrico-corto'),

  ('VES-00304', 'Vestido corto dorado asimétrico con espalda descubierta', 'vestido', 'M', 'Dorado', 0, 1000, 'disponible',
   '/images/vestidos/vestido-dorado-asimetrico-corto.jpg',
   array['/images/vestidos/vestido-dorado-asimetrico-corto.jpg', '/images/vestidos/vestido-dorado-asimetrico-corto-espalda.jpg'],
   'Vestido corto dorado metalizado con un solo hombro, silueta entallada y espalda descubierta con hebilla decorativa.',
   'vestido-dorado-asimetrico-corto'),

  ('VES-00305', 'Vestido corto dorado asimétrico con espalda descubierta', 'vestido', 'L', 'Dorado', 0, 1000, 'disponible',
   '/images/vestidos/vestido-dorado-asimetrico-corto.jpg',
   array['/images/vestidos/vestido-dorado-asimetrico-corto.jpg', '/images/vestidos/vestido-dorado-asimetrico-corto-espalda.jpg'],
   'Vestido corto dorado metalizado con un solo hombro, silueta entallada y espalda descubierta con hebilla decorativa.',
   'vestido-dorado-asimetrico-corto');
