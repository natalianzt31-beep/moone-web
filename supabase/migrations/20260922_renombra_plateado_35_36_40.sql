-- Môone — Renombra a "Plateado" las sandalias altas talle 35, 36 y 40
-- que estaban con el color "Peltre" (el tono real es plateado brillante,
-- distinto del gris metalizado más oscuro que sí es "Peltre" en 37-39).

update products set
  nombre = 'Sandalia alta plateado talle 35',
  color = 'Plateado'
where sku = 'SAN-00003';

update products set
  nombre = 'Sandalia alta plateado talle 36',
  color = 'Plateado'
where sku = 'SAN-00009';

update products set
  nombre = 'Sandalia alta plateado talle 40',
  color = 'Plateado'
where sku = 'SAN-00033';
