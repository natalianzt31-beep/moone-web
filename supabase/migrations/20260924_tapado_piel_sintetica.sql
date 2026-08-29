-- Môone — Primer tapado del catálogo: campera corta de piel sintética
-- negra, disponible en S, M y L. Agrupada con grupo_producto (mismo
-- mecanismo que las sandalias) para que se muestre como una sola
-- tarjeta con selector de talle en Colección.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, foto_url, grupo_producto, descripcion, descripcion_web)
values
  ('TAP-00001', 'Tapado corto de piel sintética negra talle S', 'tapado', 'S', 'Negro', 590,
   '/images/tapados/tapado-negro-piel-sintetica.jpg', 'tapado-negro-piel-sintetica',
   'Tapado corto de piel sintética negra, mangas largas y frente abierto',
   'Tapado corto de piel sintética negra, con mangas largas y frente abierto, el abrigo statement ideal para elevar cualquier look de noche.'),

  ('TAP-00002', 'Tapado corto de piel sintética negra talle M', 'tapado', 'M', 'Negro', 590,
   '/images/tapados/tapado-negro-piel-sintetica.jpg', 'tapado-negro-piel-sintetica',
   'Tapado corto de piel sintética negra, mangas largas y frente abierto',
   'Tapado corto de piel sintética negra, con mangas largas y frente abierto, el abrigo statement ideal para elevar cualquier look de noche.'),

  ('TAP-00003', 'Tapado corto de piel sintética negra talle L', 'tapado', 'L', 'Negro', 590,
   '/images/tapados/tapado-negro-piel-sintetica.jpg', 'tapado-negro-piel-sintetica',
   'Tapado corto de piel sintética negra, mangas largas y frente abierto',
   'Tapado corto de piel sintética negra, con mangas largas y frente abierto, el abrigo statement ideal para elevar cualquier look de noche.');
