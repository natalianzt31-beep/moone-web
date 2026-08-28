-- Môone — Fase 4: panel /admin + poner al día el esquema real
--
-- La base ya tenía una capa de staff hecha por otra vía (tabla
-- `staff_users` + función `is_staff()`), distinta de lo que yo había
-- planeado (`admins`/`is_admin()`). Este script se apoya en lo que ya
-- existe en vez de duplicarlo, y de paso pone al día un par de cambios
-- de migraciones anteriores que nunca llegaron a aplicarse (Colección
-- por categoría, On Sale y el carrito ya dependían de esto en el código
-- pero la tabla real seguía con el esquema viejo).

-- 1. staff_users tenía RLS activado pero cero políticas: nadie podía
--    leer ni su propia fila (el login de /admin igual funciona porque
--    is_staff() es security definer, pero conviene poder leer la fila).
create policy "una staff ve su propia fila"
  on staff_users for select
  using (user_id = auth.uid());

-- 2. is_staff() no tenía search_path fijo (warning del linter de
--    seguridad de Supabase).
alter function is_staff() set search_path = public;

-- 3. products: categorías mono/tapado, de la migración 20260828 que
--    nunca se aplicó (el resto de esa migración, en_venta/precio_venta,
--    quedó obsoleto: la tabla real ya trae precio_venta y "en venta"
--    se define como precio_venta is not null, sin columna aparte).
alter table products drop constraint products_categoria_check;
alter table products add constraint products_categoria_check
  check (categoria in ('vestido', 'mono', 'sandalias', 'cartera', 'tapado'));

-- 4. cart_items: el carrito distingue alquiler vs. venta por ítem; la
--    tabla real no tenía esa columna (de la migración 20260829).
alter table cart_items add column if not exists tipo text not null default 'alquiler'
  check (tipo in ('alquiler', 'venta'));
alter table cart_items add constraint cart_items_cart_product_tipo_key
  unique (cart_id, product_id, tipo);

-- 5. Un carrito por clienta.
alter table carts add constraint carts_client_id_key unique (client_id);

-- 6. Medio de pago, para el reporte "pagos por medio" de /admin/reportes.
alter table reservations add column medio_pago text
  check (medio_pago in ('efectivo', 'transferencia', 'mercado_pago', 'tarjeta', 'otro'));
