-- Môone — Vestido midi negro cruzado con falda plisada, en venta definitiva.
-- Diseño único, talle XXL.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00317', 'Vestido midi negro cruzado con falda plisada', 'vestido', 'XXL', 'Negro', 0, 2100, 'disponible',
   '/images/vestidos/vestido-negro-plisado-cruzado.jpg',
   array['/images/vestidos/vestido-negro-plisado-cruzado.jpg', '/images/vestidos/vestido-negro-plisado-cruzado-espalda.jpg'],
   'Vestido midi negro cruzado con escote en V, mangas largas con puño, cinturón para atar en la cintura y falda plisada. Detalle de lazo en el cuello por la espalda.');
