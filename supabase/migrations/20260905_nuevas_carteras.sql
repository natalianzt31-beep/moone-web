-- Môone — 5 carteras nuevas con foto real (antes solo había placeholders
-- "Sobre de fiesta" sin foto). Precio de alquiler igual al resto de la
-- categoría ($290), a ajustar en /admin/stock si corresponde.

insert into products (sku, nombre, categoria, color, precio_alquiler, foto_url, descripcion, descripcion_web)
values
  ('CAR-00011', 'Cartera dorada cilíndrica con broche en V', 'cartera', 'Dorado', 290,
   '/images/carteras/cartera-dorada-cilindrica.jpg',
   'Cartera cilíndrica dorada con costura diagonal y broche metálico en V',
   'Cartera cilíndrica en cuero dorado texturado, con costura diagonal y broche metálico en V, un statement brillante para cualquier look de fiesta.'),

  ('CAR-00012', 'Cartera plateada con manija', 'cartera', 'Plateado', 290,
   '/images/carteras/cartera-plateada-manija.jpg',
   'Cartera plateada con manija superior y solapa',
   'Cartera plateada de silueta trapezoidal, con manija superior redonda y solapa, en cuero texturado ideal para una velada elegante.'),

  ('CAR-00013', 'Cartera negra con solapa de brillos', 'cartera', 'Negro', 290,
   '/images/carteras/cartera-negra-brillos.jpg',
   'Cartera negra de gamuza con solapa de brillos y manija superior',
   'Cartera negra de gamuza con manija superior y solapa cubierta de brillos, el equilibrio perfecto entre sobriedad y destello para la noche.'),

  ('CAR-00014', 'Clutch negro plisado con broche dorado', 'cartera', 'Negro', 290,
   '/images/carteras/clutch-negro-plisado.jpg',
   'Clutch cilíndrico negro plisado con broche metálico dorado en diagonal',
   'Clutch cilíndrico en tela plisada negra, con un broche metálico dorado en diagonal que le da un toque escultural a cualquier outfit de gala.'),

  ('CAR-00015', 'Clutch sobre dorado', 'cartera', 'Dorado', 290,
   '/images/carteras/clutch-sobre-dorado.jpg',
   'Clutch sobre dorado de silueta rectangular',
   'Clutch sobre en cuero dorado texturado, de silueta rectangular y solapa en punta, minimalista y luminoso para cerrar el look.');
