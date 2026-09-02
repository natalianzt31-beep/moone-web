-- Môone — 4 vestidos azules nuevos en venta definitiva.
-- Cada uno es un diseño distinto en un solo talle (sin grupo_producto).

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, precio_venta, estado, foto_url, fotos, descripcion_web)
values
  ('VES-00284', 'Vestido largo azul marino escote V con encaje', 'vestido', 'L', 'Azul marino', 0, 2800, 'disponible',
   '/images/vestidos/vestido-azul-marino-encaje-v.jpg',
   array['/images/vestidos/vestido-azul-marino-encaje-v.jpg', '/images/vestidos/vestido-azul-marino-encaje-v-espalda.jpg'],
   'Vestido largo azul marino con escote en V bordado en encaje con pedrería, breteles anchos y falda de gasa suelta.'),

  ('VES-00285', 'Vestido largo azul rey cruzado plisado', 'vestido', 'XXL', 'Azul rey', 0, 2100, 'disponible',
   '/images/vestidos/vestido-azul-rey-cruzado-plisado.jpg',
   array['/images/vestidos/vestido-azul-rey-cruzado-plisado.jpg', '/images/vestidos/vestido-azul-rey-cruzado-plisado-espalda.jpg'],
   'Vestido largo azul rey con escote cruzado, mangas largas, cinturón para atar en la cintura y falda plisada de caída fluida.'),

  ('VES-00286', 'Vestido largo azul ilusión con cinturón', 'vestido', 'L', 'Azul', 0, 2800, 'disponible',
   '/images/vestidos/vestido-azul-ilusion-cinturon.jpg',
   array['/images/vestidos/vestido-azul-ilusion-cinturon.jpg', '/images/vestidos/vestido-azul-ilusion-cinturon-espalda.jpg'],
   'Vestido largo azul con escote ilusión y corpiño drapeado, cinturón fino en la cintura y falda de gasa suelta.'),

  ('VES-00287', 'Vestido largo azul marino de encaje con tajo', 'vestido', 'M', 'Azul marino', 0, 2100, 'disponible',
   '/images/vestidos/vestido-azul-marino-encaje-tajo.jpg',
   array['/images/vestidos/vestido-azul-marino-encaje-tajo.jpg', '/images/vestidos/vestido-azul-marino-encaje-tajo-espalda.jpg'],
   'Vestido largo de encaje azul marino con breteles finos, escote recto y tajo frontal, silueta entallada.');
