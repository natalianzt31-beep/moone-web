-- Môone — Agrega talle XL al tapado negro y da grupo_producto propio al
-- tapado blanco para que muestre el desplegable de talle aunque sea el
-- único talle (M).

insert into products (sku, nombre, categoria, talle, color, precio_alquiler, foto_url, grupo_producto, descripcion, descripcion_web, estado)
values (
  'TAP-00005', 'Tapado corto de piel sintética negra talle XL', 'tapado', 'XL', 'Negro', 590,
  '/images/tapados/tapado-negro-piel-sintetica.jpg', 'tapado-negro-piel-sintetica',
  'Tapado corto de piel sintética negra, mangas largas y frente abierto',
  'Tapado corto de piel sintética negra, con mangas largas y frente abierto, el abrigo statement ideal para elevar cualquier look de noche.',
  'disponible'
);

update products
set grupo_producto = 'tapado-blanco-piel-sintetica'
where sku = 'TAP-00004';
