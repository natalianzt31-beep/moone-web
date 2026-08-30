-- Môone — Ajuste de precio del vestido largo corset plateado con tajo

update products
set precio_venta = 1800
where sku in ('VES-00269', 'VES-00270', 'VES-00271', 'VES-00272');
