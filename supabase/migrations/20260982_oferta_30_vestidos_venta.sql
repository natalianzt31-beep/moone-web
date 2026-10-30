-- Môone — Oferta "Liquidamos" del 30% en los vestidos en venta definitiva.
-- precio_venta_original guarda el precio de lista para mostrarlo tachado en
-- la web; precio_venta pasa a ser el precio con el 30% de descuento ya
-- aplicado (redondeado a la decena). Solo afecta vestidos en venta que
-- todavía están disponibles (no baja_definitiva).

alter table products add column if not exists precio_venta_original numeric;

update products
set precio_venta_original = precio_venta,
    precio_venta = round(precio_venta * 0.7 / 10) * 10
where categoria = 'vestido'
  and precio_venta is not null
  and estado <> 'baja_definitiva'
  and precio_venta_original is null;
