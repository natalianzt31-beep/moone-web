-- Môone — Nueva categoría "Accesorios"

alter table products drop constraint products_categoria_check;
alter table products add constraint products_categoria_check
  check (categoria in ('vestido', 'mono', 'sandalias', 'cartera', 'tapado', 'accesorio'));
