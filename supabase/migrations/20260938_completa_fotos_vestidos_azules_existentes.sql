-- Môone — Completa fotos de dos vestidos azules que ya estaban cargados
-- (VES-00288/289/290) sin foto_url/fotos. No se insertan filas nuevas:
-- ya existían con nombre, precio y talle correctos.

update products set
  foto_url = '/images/vestidos/vestido-azul-satinado-offshoulder.jpg',
  fotos = array['/images/vestidos/vestido-azul-satinado-offshoulder.jpg', '/images/vestidos/vestido-azul-satinado-offshoulder-espalda.jpg']
where sku = 'VES-00288';

update products set
  foto_url = '/images/vestidos/vestido-azul-capa-plisado.jpg',
  fotos = array['/images/vestidos/vestido-azul-capa-plisado.jpg', '/images/vestidos/vestido-azul-capa-plisado-espalda.jpg'],
  grupo_producto = 'vestido-azul-capa-plisado'
where sku in ('VES-00289', 'VES-00290');
