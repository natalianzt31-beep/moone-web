-- Môone — Tapado corto de piel sintética blanca, solo talle M
-- (sin grupo_producto: al ser un único talle no necesita agruparse,
-- se muestra como tarjeta individual). Mismo precio que el tapado
-- negro de la misma línea.

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, foto_url, descripcion, descripcion_web)
values
  ('TAP-00004', 'Tapado corto de piel sintética blanca talle M', 'tapado', 'M', 'Blanco', 590,
   '/images/tapados/tapado-blanco-piel-sintetica.jpg',
   'Tapado corto de piel sintética blanca, mangas largas y frente abierto',
   'Tapado corto de piel sintética blanca, con mangas largas y frente abierto, un abrigo statement ideal para elevar cualquier look de noche.');
