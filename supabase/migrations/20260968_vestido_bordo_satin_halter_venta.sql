-- Môone — Vestido largo bordo de satén con cuello halter y espalda
-- descubierta con lazo, en venta definitiva. Mismo diseño en talles S y M,
-- agrupado con grupo_producto para mostrar un selector de talle en el
-- catálogo.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web, grupo_producto)
values
  ('VES-00326', 'Vestido largo bordo satinado con cuello halter y espalda descubierta', 'vestido', 'S', 'Bordo', 0, 2100, 'disponible',
   '/images/vestidos/vestido-bordo-satin-halter.jpg',
   array['/images/vestidos/vestido-bordo-satin-halter.jpg', '/images/vestidos/vestido-bordo-satin-halter-espalda.jpg'],
   'Vestido largo bordo de satén con cuello halter, escote en V profundo, cintura marcada y espalda descubierta con lazo para atar.',
   'vestido-bordo-satin-halter'),

  ('VES-00327', 'Vestido largo bordo satinado con cuello halter y espalda descubierta', 'vestido', 'M', 'Bordo', 0, 2100, 'disponible',
   '/images/vestidos/vestido-bordo-satin-halter.jpg',
   array['/images/vestidos/vestido-bordo-satin-halter.jpg', '/images/vestidos/vestido-bordo-satin-halter-espalda.jpg'],
   'Vestido largo bordo de satén con cuello halter, escote en V profundo, cintura marcada y espalda descubierta con lazo para atar.',
   'vestido-bordo-satin-halter');
