-- Môone — Suaviza la mención de "abdomen expuesto" en el vestido VES-00035
--
-- Era el único producto del catálogo con esa frase (en nombre y
-- descripcion_web). Se cambia a "cavado en la cintura", más sutil y
-- consistente con el resto de las descripciones.

update products set
  nombre = 'Vestido con brillos y cavado en la cintura',
  descripcion_web = 'Vestido largo con brillos y cavado en la cintura, una pieza statement para ocasiones especiales.'
where sku = 'VES-00035';
