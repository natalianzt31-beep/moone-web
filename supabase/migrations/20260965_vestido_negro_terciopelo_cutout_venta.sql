-- Môone — Vestido corto negro de terciopelo con recorte de tul en la
-- cintura, en venta definitiva. Diseño único, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00320', 'Vestido corto negro de terciopelo con recorte en la cintura', 'vestido', 'S', 'Negro', 0, 1000, 'disponible',
   '/images/vestidos/vestido-negro-terciopelo-cutout.jpg',
   array['/images/vestidos/vestido-negro-terciopelo-cutout.jpg', '/images/vestidos/vestido-negro-terciopelo-cutout-espalda.jpg'],
   'Vestido corto negro de terciopelo con corpiño estilo corset, breteles finos, recorte de tul transparente en la cintura y cuerpo entallado.');
