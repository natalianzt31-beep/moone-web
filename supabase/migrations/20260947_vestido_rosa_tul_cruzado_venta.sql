-- Môone — Vestido midi rosa de tul con espalda cruzada, en venta
-- definitiva. Diseño único, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00302', 'Vestido midi rosa de tul con espalda cruzada', 'vestido', 'S', 'Rosa', 0, 1600, 'disponible',
   '/images/vestidos/vestido-rosa-tul-cruzado.jpg',
   array['/images/vestidos/vestido-rosa-tul-cruzado.jpg', '/images/vestidos/vestido-rosa-tul-cruzado-espalda.jpg'],
   'Vestido midi rosa de tul con escote cruzado en V, breteles finos y espalda descubierta con tiras cruzadas. Falda vaporosa de vuelo amplio.');
