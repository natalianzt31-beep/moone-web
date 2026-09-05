-- Môone — Vestido bordo satinado con espalda cruzada, en venta definitiva.
-- Diseño único, talle XL.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00315', 'Vestido largo bordo satinado con espalda cruzada', 'vestido', 'XL', 'Bordo', 0, 1000, 'disponible',
   '/images/vestidos/vestido-bordo-satin-cruzado.jpg',
   array['/images/vestidos/vestido-bordo-satin-cruzado.jpg', '/images/vestidos/vestido-bordo-satin-cruzado-espalda.jpg'],
   'Vestido largo de satén bordo con escote drapeado, breteles finos y espalda descubierta con tiras cruzadas para atar.');
