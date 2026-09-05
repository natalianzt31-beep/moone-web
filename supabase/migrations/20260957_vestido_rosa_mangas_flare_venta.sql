-- Môone — Vestido rosa palo con mangas flare, en venta definitiva.
-- Diseño único, talle XL.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00314', 'Vestido largo rosa palo con mangas flare', 'vestido', 'XL', 'Rosa palo', 0, 1000, 'disponible',
   '/images/vestidos/vestido-rosa-mangas-flare.jpg',
   array['/images/vestidos/vestido-rosa-mangas-flare.jpg', '/images/vestidos/vestido-rosa-mangas-flare-espalda.jpg'],
   'Vestido largo rosa palo con escote en V, mangas cortas con vuelo y cinturón ancho en la cintura. Falda amplia y suelta.');
