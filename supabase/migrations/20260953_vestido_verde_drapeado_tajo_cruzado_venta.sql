-- Môone — Vestido verde satinado drapeado con tajo, en venta definitiva.
-- Diseño único, talle L.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00311', 'Vestido largo verde satinado drapeado con tajo', 'vestido', 'L', 'Verde', 0, 1600, 'disponible',
   '/images/vestidos/vestido-verde-drapeado-tajo-cruzado.jpg',
   array['/images/vestidos/vestido-verde-drapeado-tajo-cruzado.jpg', '/images/vestidos/vestido-verde-drapeado-tajo-cruzado-espalda.jpg'],
   'Vestido largo de satén verde esmeralda con escote corazón, drapeado cruzado en la cintura, tajo frontal y espalda descubierta en V.');
