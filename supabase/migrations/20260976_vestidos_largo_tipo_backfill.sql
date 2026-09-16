-- El filtro "Corto o largo" de /coleccion/vestidos mostraba una sola
-- opción duplicada porque casi ningún vestido tenía largo_tipo cargado.
-- El nombre del producto ya distingue "Vestido corto ..." de "Vestido
-- largo ...", así que se usa eso para completar el campo. Los que no
-- mencionan explícitamente "corto" ni "largo" en el nombre (ej. "midi",
-- o nombres sin esa palabra) quedan sin tocar en vez de adivinar.

update products
set largo_tipo = 'Largo'
where categoria = 'vestido'
  and largo_tipo is null
  and nombre ~* '\mlargo\M';

update products
set largo_tipo = 'Corto'
where categoria = 'vestido'
  and largo_tipo is null
  and nombre ~* '\mcorto\M';
