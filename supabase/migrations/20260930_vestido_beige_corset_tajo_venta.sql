-- Môone — Vestido largo corset beige con tajo, venta definitiva (S, M, L)
-- Ya cargado con frente + espalda en fotos (carrusel).

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, grupo_producto, descripcion_web)
values
  ('VES-00276', 'Vestido largo corset beige con tajo', 'vestido', 'S', 'Beige', 0, 1800, 'disponible',
   '/images/vestidos/vestido-beige-corset-tajo.jpg',
   array['/images/vestidos/vestido-beige-corset-tajo.jpg', '/images/vestidos/vestido-beige-corset-tajo-espalda.jpg'],
   'vestido-beige-corset-tajo',
   'Vestido largo en tono beige con corpiño estilo corset, breteles finos y cierre de cordones en la espalda. Falda entallada con tajo frontal.'),
  ('VES-00277', 'Vestido largo corset beige con tajo', 'vestido', 'M', 'Beige', 0, 1800, 'disponible',
   '/images/vestidos/vestido-beige-corset-tajo.jpg',
   array['/images/vestidos/vestido-beige-corset-tajo.jpg', '/images/vestidos/vestido-beige-corset-tajo-espalda.jpg'],
   'vestido-beige-corset-tajo',
   'Vestido largo en tono beige con corpiño estilo corset, breteles finos y cierre de cordones en la espalda. Falda entallada con tajo frontal.'),
  ('VES-00278', 'Vestido largo corset beige con tajo', 'vestido', 'L', 'Beige', 0, 1800, 'disponible',
   '/images/vestidos/vestido-beige-corset-tajo.jpg',
   array['/images/vestidos/vestido-beige-corset-tajo.jpg', '/images/vestidos/vestido-beige-corset-tajo-espalda.jpg'],
   'vestido-beige-corset-tajo',
   'Vestido largo en tono beige con corpiño estilo corset, breteles finos y cierre de cordones en la espalda. Falda entallada con tajo frontal.');
