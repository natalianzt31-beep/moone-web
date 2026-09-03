-- Môone — Vestido largo dorado escote drapeado con espalda descubierta,
-- en venta definitiva. Mismo diseño en talles M, L y XL, agrupado con
-- grupo_producto para mostrar un selector de talle en el catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00306', 'Vestido largo dorado escote drapeado con espalda descubierta', 'vestido', 'M', 'Dorado', 0, 1600, 'disponible',
   '/images/vestidos/vestido-dorado-cowl-drapeado.jpg',
   array['/images/vestidos/vestido-dorado-cowl-drapeado.jpg', '/images/vestidos/vestido-dorado-cowl-drapeado-espalda.jpg'],
   'Vestido largo dorado metalizado con escote drapeado, breteles finos, drapeado lateral en la cintura y espalda descubierta con tiras cruzadas para atar.',
   'vestido-dorado-cowl-drapeado'),

  ('VES-00307', 'Vestido largo dorado escote drapeado con espalda descubierta', 'vestido', 'L', 'Dorado', 0, 1600, 'disponible',
   '/images/vestidos/vestido-dorado-cowl-drapeado.jpg',
   array['/images/vestidos/vestido-dorado-cowl-drapeado.jpg', '/images/vestidos/vestido-dorado-cowl-drapeado-espalda.jpg'],
   'Vestido largo dorado metalizado con escote drapeado, breteles finos, drapeado lateral en la cintura y espalda descubierta con tiras cruzadas para atar.',
   'vestido-dorado-cowl-drapeado'),

  ('VES-00308', 'Vestido largo dorado escote drapeado con espalda descubierta', 'vestido', 'XL', 'Dorado', 0, 1600, 'disponible',
   '/images/vestidos/vestido-dorado-cowl-drapeado.jpg',
   array['/images/vestidos/vestido-dorado-cowl-drapeado.jpg', '/images/vestidos/vestido-dorado-cowl-drapeado-espalda.jpg'],
   'Vestido largo dorado metalizado con escote drapeado, breteles finos, drapeado lateral en la cintura y espalda descubierta con tiras cruzadas para atar.',
   'vestido-dorado-cowl-drapeado');
