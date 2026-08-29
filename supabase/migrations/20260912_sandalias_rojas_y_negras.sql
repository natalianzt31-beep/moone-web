-- Môone — Fotos y descripción de sandalias altas rojas (35-40) y
-- negras de charol (35-39)

update products set
  foto_url = '/images/sandalias/sandalia-alta-rojo-cruzada.jpg',
  descripcion = 'Sandalia roja con tiras cruzadas en la punta, tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia roja con tiras cruzadas en la punta y tobillera con hebilla, sobre plataforma y taco alto grueso, un color statement para la noche.'
where sku in ('SAN-00005', 'SAN-00011', 'SAN-00017', 'SAN-00023', 'SAN-00029', 'SAN-00035');

update products set
  foto_url = '/images/sandalias/sandalia-alta-negro-charol.jpg',
  descripcion = 'Sandalia negra de charol con tiras cruzadas en la punta, doble tobillera con hebilla y plataforma',
  descripcion_web = 'Sandalia negra de charol con tiras cruzadas en la punta y doble tobillera con hebilla, sobre plataforma y taco alto grueso, brillante y elegante para cualquier fiesta.'
where sku in ('SAN-00002', 'SAN-00008', 'SAN-00014', 'SAN-00020', 'SAN-00026');
