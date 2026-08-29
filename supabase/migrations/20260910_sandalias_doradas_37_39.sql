-- Môone — Fotos y descripción para las sandalias doradas talle 37-39
--
-- Las dos fotos recibidas venían con tonos de dorado distintos (una
-- más amarilla, otra rosada); se unificó el tono en el procesamiento
-- de imagen antes de subirlas (transferencia de color a la segunda
-- foto usando la primera como referencia), así ambas se ven
-- consistentes como fotos del mismo producto.

update products set
  foto_url = '/images/sandalias/sandalia-alta-dorado-cruzada.jpg',
  imagen_2_url = '/images/sandalias/sandalia-alta-dorado-cruzada-perfil.jpg',
  descripcion = 'Sandalia dorada con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia dorada con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, cómoda para bailar toda la noche.'
where sku in ('SAN-00016', 'SAN-00022', 'SAN-00028');
