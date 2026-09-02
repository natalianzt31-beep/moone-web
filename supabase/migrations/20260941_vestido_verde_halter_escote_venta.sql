-- Môone — Vestido verde satinado escote halter, en venta definitiva.
-- Mismo diseño en talles S, M, L y XL, agrupado con grupo_producto para
-- mostrar un selector de talle en el catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00294', 'Vestido largo verde satinado escote halter', 'vestido', 'S', 'Verde', 0, 2100, 'disponible',
   '/images/vestidos/vestido-verde-halter-escote.jpg',
   array['/images/vestidos/vestido-verde-halter-escote.jpg', '/images/vestidos/vestido-verde-halter-escote-espalda.jpg'],
   'Vestido largo de satén verde con cuello halter, recorte en forma de gota en el escote y espalda descubierta con tiras cruzadas.',
   'vestido-verde-halter-escote'),

  ('VES-00295', 'Vestido largo verde satinado escote halter', 'vestido', 'M', 'Verde', 0, 2100, 'disponible',
   '/images/vestidos/vestido-verde-halter-escote.jpg',
   array['/images/vestidos/vestido-verde-halter-escote.jpg', '/images/vestidos/vestido-verde-halter-escote-espalda.jpg'],
   'Vestido largo de satén verde con cuello halter, recorte en forma de gota en el escote y espalda descubierta con tiras cruzadas.',
   'vestido-verde-halter-escote'),

  ('VES-00296', 'Vestido largo verde satinado escote halter', 'vestido', 'L', 'Verde', 0, 2100, 'disponible',
   '/images/vestidos/vestido-verde-halter-escote.jpg',
   array['/images/vestidos/vestido-verde-halter-escote.jpg', '/images/vestidos/vestido-verde-halter-escote-espalda.jpg'],
   'Vestido largo de satén verde con cuello halter, recorte en forma de gota en el escote y espalda descubierta con tiras cruzadas.',
   'vestido-verde-halter-escote'),

  ('VES-00297', 'Vestido largo verde satinado escote halter', 'vestido', 'XL', 'Verde', 0, 2100, 'disponible',
   '/images/vestidos/vestido-verde-halter-escote.jpg',
   array['/images/vestidos/vestido-verde-halter-escote.jpg', '/images/vestidos/vestido-verde-halter-escote-espalda.jpg'],
   'Vestido largo de satén verde con cuello halter, recorte en forma de gota en el escote y espalda descubierta con tiras cruzadas.',
   'vestido-verde-halter-escote');
