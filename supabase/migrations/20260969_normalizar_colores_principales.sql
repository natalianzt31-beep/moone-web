-- Môone — el filtro de color en /coleccion y /sale se arma con los valores
-- distintos de products.color, así que variantes de un mismo color
-- (Azul rey, Azul marino, Verde salvia, etc.) aparecían como colores
-- separados en el filtro. Se consolidan en el color principal.
-- No se toca "Dorado/Plateado": es un producto realmente bicolor, no una
-- variante de un solo color.

update products set color = 'Azul' where color in ('Azul marino', 'Azul rey');
update products set color = 'Bordo' where color = 'Bordó';
update products set color = 'Rosa' where color in ('Rosa palo', 'Rosado');
update products set color = 'Verde' where color in ('Verde azulado', 'Verde esmeralda', 'Verde salvia');
