-- Môone — Vestido corto durazno estampado de palmeras con capa, en venta
-- definitiva. Diseño único, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00313', 'Vestido corto durazno estampado de palmeras con capa', 'vestido', 'S', 'Durazno', 0, 1600, 'disponible',
   '/images/vestidos/vestido-durazno-palmeras.jpg',
   array['/images/vestidos/vestido-durazno-palmeras.jpg', '/images/vestidos/vestido-durazno-palmeras-espalda.jpg'],
   'Vestido corto durazno con estampado de palmeras, escote en V, cintura ajustada y capa asimétrica de gasa transparente. Espalda descubierta con tiras cruzadas.');
