-- Môone — Carrusel de fotos por producto
--
-- foto_url se mantiene como portada/compatibilidad (lo siguen usando
-- 350+ productos con una sola foto). fotos es la lista completa y
-- ordenada; cuando tiene más de un elemento, la ficha muestra un
-- carrusel con flechas y se puede avanzar clickeando la imagen.

alter table products add column if not exists fotos text[];

update products
set fotos = array['/images/vestidos/vestido-plateado-corset-tajo.jpg', '/images/vestidos/vestido-plateado-corset-tajo-espalda.jpg']
where sku in ('VES-00269', 'VES-00270', 'VES-00271', 'VES-00272');

update products
set fotos = array['/images/vestidos/vestido-plateado-mini-asimetrico.jpg', '/images/vestidos/vestido-plateado-mini-asimetrico-espalda.jpg']
where sku in ('VES-00273', 'VES-00274', 'VES-00275');
