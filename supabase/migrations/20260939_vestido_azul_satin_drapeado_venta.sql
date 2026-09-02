-- Môone — Vestido azul satinado con escote drapeado, en venta definitiva.
-- Mismo diseño en talles S y M, agrupado con grupo_producto para mostrar
-- un selector de talle en el catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00291', 'Vestido largo azul satinado con escote drapeado', 'vestido', 'S', 'Azul', 0, 1600, 'disponible',
   '/images/vestidos/vestido-azul-satin-drapeado.jpg',
   array['/images/vestidos/vestido-azul-satin-drapeado.jpg', '/images/vestidos/vestido-azul-satin-drapeado-espalda.jpg'],
   'Vestido largo de satén azul con escote en V drapeado, breteles finos, espalda descubierta y falda amplia con tablas.',
   'vestido-azul-satin-drapeado'),

  ('VES-00292', 'Vestido largo azul satinado con escote drapeado', 'vestido', 'M', 'Azul', 0, 1600, 'disponible',
   '/images/vestidos/vestido-azul-satin-drapeado.jpg',
   array['/images/vestidos/vestido-azul-satin-drapeado.jpg', '/images/vestidos/vestido-azul-satin-drapeado-espalda.jpg'],
   'Vestido largo de satén azul con escote en V drapeado, breteles finos, espalda descubierta y falda amplia con tablas.',
   'vestido-azul-satin-drapeado');
