-- Agrega un slug único y legible por producto, para URLs SEO-friendly
-- (/vestidos/[slug]). Un mismo diseño (agrupado por grupo_producto, o la
-- fila individual si no tiene grupo) comparte un solo slug entre todos
-- sus talles. Cuando el nombre incluye el talle al final (ej. "Sandalia
-- alta blanco talle 35"), se lo recorta antes de generar el slug para que
-- todos los talles del mismo diseño den el mismo resultado. Si dos
-- diseños distintos generan el mismo slug base, se desambigua agregando
-- "-2", "-3", etc.

create extension if not exists unaccent;

alter table products add column if not exists slug text;

-- Había un índice único parcial (idx_products_slug) con datos sueltos de
-- un intento previo, no referenciado por ningún código de la app (slug
-- por fila/SKU, no por diseño). Se reemplaza por el esquema de esta
-- migración (un slug por diseño) y por el constraint de más abajo.
drop index if exists idx_products_slug;

with row_group as (
  select
    id,
    coalesce(grupo_producto, id::text) as group_key,
    regexp_replace(nombre, '\s+talle\s+\S+\s*$', '', 'i') as clean_nombre
  from products
),
group_info as (
  select
    group_key,
    min(clean_nombre) as clean_nombre,
    min(id::text) as first_id
  from row_group
  group by group_key
),
group_base_slug as (
  select
    group_key,
    first_id,
    trim(both '-' from regexp_replace(lower(unaccent(clean_nombre)), '[^a-z0-9]+', '-', 'g')) as base_slug
  from group_info
),
group_final_slug as (
  select
    group_key,
    case
      when row_number() over (partition by base_slug order by first_id) = 1
        then base_slug
      else base_slug || '-' || row_number() over (partition by base_slug order by first_id)
    end as slug
  from group_base_slug
)
update products p
set slug = gfs.slug
from row_group rg
join group_final_slug gfs on gfs.group_key = rg.group_key
where rg.id = p.id;

alter table products alter column slug set not null;

-- No es UNIQUE a nivel de fila a propósito: los distintos talles de un
-- mismo diseño comparten el mismo slug (una sola URL /vestidos/[slug]
-- por diseño, con selector de talle). La desambiguación entre diseños
-- distintos ya se resuelve arriba, al calcular group_final_slug.
create index if not exists idx_products_slug on products (slug);
