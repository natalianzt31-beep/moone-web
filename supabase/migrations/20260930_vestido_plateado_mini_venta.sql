-- Môone — Segundo vestido en venta definitiva: mini plateado asimétrico
-- (S, M, L), agrupado con grupo_producto para una sola tarjeta en /sale.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, grupo_producto, descripcion_web)
values
  ('VES-00273', 'Vestido corto plateado asimétrico', 'vestido', 'S', 'Plateado', 0, 1000, 'disponible', '/images/vestidos/vestido-plateado-mini-asimetrico.jpg', 'vestido-plateado-mini-asimetrico', 'Vestido corto en tono plateado con efecto holográfico, escote asimétrico a un hombro y espalda descubierta con detalle de hebilla. Silueta entallada.'),
  ('VES-00274', 'Vestido corto plateado asimétrico', 'vestido', 'M', 'Plateado', 0, 1000, 'disponible', '/images/vestidos/vestido-plateado-mini-asimetrico.jpg', 'vestido-plateado-mini-asimetrico', 'Vestido corto en tono plateado con efecto holográfico, escote asimétrico a un hombro y espalda descubierta con detalle de hebilla. Silueta entallada.'),
  ('VES-00275', 'Vestido corto plateado asimétrico', 'vestido', 'L', 'Plateado', 0, 1000, 'disponible', '/images/vestidos/vestido-plateado-mini-asimetrico.jpg', 'vestido-plateado-mini-asimetrico', 'Vestido corto en tono plateado con efecto holográfico, escote asimétrico a un hombro y espalda descubierta con detalle de hebilla. Silueta entallada.');
