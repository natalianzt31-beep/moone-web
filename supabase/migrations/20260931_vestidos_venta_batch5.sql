-- Môone — 5 vestidos nuevos en venta definitiva, $1.000 c/u.
-- Cada uno es un diseño distinto en un solo talle (sin grupo_producto).
-- El bordó es talle L; el resto, talle S.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00279', 'Vestido corto plateado strapless', 'vestido', 'S', 'Plateado', 0, 1000, 'disponible',
   '/images/vestidos/vestido-plateado-strapless-mini.jpg',
   array['/images/vestidos/vestido-plateado-strapless-mini.jpg', '/images/vestidos/vestido-plateado-strapless-mini-espalda.jpg'],
   'Vestido corto strapless en tono plateado con textura brillante, escote con panel triangular y silueta entallada.'),

  ('VES-00280', 'Vestido corto verde azulado drapeado', 'vestido', 'S', 'Verde azulado', 0, 1000, 'disponible',
   '/images/vestidos/vestido-verde-azulado-drapeado.jpg',
   array['/images/vestidos/vestido-verde-azulado-drapeado.jpg', '/images/vestidos/vestido-verde-azulado-drapeado-espalda.jpg'],
   'Vestido corto en satén verde azulado, escote en V con corpiño estructurado y falda drapeada con frunce lateral.'),

  ('VES-00281', 'Vestido corto bordó escote cruzado', 'vestido', 'L', 'Bordó', 0, 1000, 'disponible',
   '/images/vestidos/vestido-bordo-escote-cruzado.jpg',
   array['/images/vestidos/vestido-bordo-escote-cruzado.jpg', '/images/vestidos/vestido-bordo-escote-cruzado-espalda.jpg'],
   'Vestido corto bordó con estampa texturada, escote profundo en V y espalda descubierta con tiras cruzadas.'),

  ('VES-00282', 'Vestido largo rosado de lentejuelas con tajo', 'vestido', 'S', 'Rosado', 0, 1000, 'disponible',
   '/images/vestidos/vestido-rosado-lentejuelas-tajo.jpg',
   array['/images/vestidos/vestido-rosado-lentejuelas-tajo.jpg', '/images/vestidos/vestido-rosado-lentejuelas-tajo-espalda.jpg'],
   'Vestido largo de lentejuelas en tono rosado, escote cruzado, breteles finos y tajo frontal.'),

  ('VES-00283', 'Vestido largo lila de gasa', 'vestido', 'S', 'Lila', 0, 1000, 'disponible',
   '/images/vestidos/vestido-lila-gasa.jpg',
   array['/images/vestidos/vestido-lila-gasa.jpg', '/images/vestidos/vestido-lila-gasa-espalda.jpg'],
   'Vestido largo de gasa en tono lila, escote en V profundo con cinta de strass en la cintura y falda amplia con caída fluida.');
