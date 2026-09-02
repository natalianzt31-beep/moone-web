-- Môone — Vestido azul corset con lazo en la espalda, en venta definitiva.
-- Diseño único, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00293', 'Vestido largo azul corset con lazo en la espalda', 'vestido', 'S', 'Azul', 0, 1000, 'disponible',
   '/images/vestidos/vestido-azul-corset-lazo.jpg',
   array['/images/vestidos/vestido-azul-corset-lazo.jpg', '/images/vestidos/vestido-azul-corset-lazo-espalda.jpg'],
   'Vestido largo azul con corpiño tipo corset bordado en encaje con pedrería, breteles finos y espalda descubierta con lazo cruzado para atar.');
