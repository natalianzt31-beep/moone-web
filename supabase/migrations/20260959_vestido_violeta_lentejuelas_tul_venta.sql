-- Môone — Vestido violeta de lentejuelas con falda de tul, en venta
-- definitiva. Diseño único, talle XL.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00316', 'Vestido largo violeta de lentejuelas con falda de tul', 'vestido', 'XL', 'Violeta', 0, 1000, 'disponible',
   '/images/vestidos/vestido-violeta-lentejuelas-tul.jpg',
   array['/images/vestidos/vestido-violeta-lentejuelas-tul.jpg', '/images/vestidos/vestido-violeta-lentejuelas-tul-espalda.jpg'],
   'Vestido largo violeta con corpiño de lentejuelas en rombos, mangas largas y cuello redondo, y falda amplia de tul.');
