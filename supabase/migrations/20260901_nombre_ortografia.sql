-- Môone — Corrige errores de tipeo en products.nombre (categorías vestido/mono)
--
-- La migración 20260831 ya había corregido descripcion_web, pero el campo
-- nombre (el título que se ve primero en cada tarjeta) nunca se tocó, y en
-- la mayoría de vestidos/monos nombre es una copia literal de la
-- descripcion original con los mismos errores de tipeo (ej. "bolado" en
-- vez de "volado", "Mono clanco" en vez de "Mono blanco").
--
-- A diferencia de 20260831 (que reescribió el texto con tono de
-- copywriting), acá solo se corrige ortografía/tipeo puntual, sin agregar
-- ni reformular contenido, para mantener nombre corto tal cual estaba.

update products set nombre = regexp_replace(nombre, '^Vestidp ', 'Vestido ') where categoria in ('vestido','mono') and nombre like 'Vestidp %';
update products set nombre = regexp_replace(nombre, '^Vetido ', 'Vestido ') where categoria in ('vestido','mono') and nombre like 'Vetido %';
update products set nombre = regexp_replace(nombre, '^Veatido ', 'Vestido ') where categoria in ('vestido','mono') and nombre like 'Veatido %';
update products set nombre = replace(nombre, 'Mono clanco', 'Mono blanco') where categoria in ('vestido','mono') and nombre like '%Mono clanco%';
update products set nombre = regexp_replace(nombre, '\ybolado\y', 'volado') where categoria in ('vestido','mono') and nombre ~ '\ybolado\y';
update products set nombre = regexp_replace(nombre, '\ypatalon\y', 'pantalón') where categoria in ('vestido','mono') and nombre ~ '\ypatalon\y';
update products set nombre = regexp_replace(nombre, '\ypantalon\y', 'pantalón') where categoria in ('vestido','mono') and nombre ~ '\ypantalon\y';
update products set nombre = regexp_replace(nombre, '\ystraples\y', 'strapless') where categoria in ('vestido','mono') and nombre ~ '\ystraples\y';
update products set nombre = regexp_replace(nombre, '\ymurcielago\y', 'murciélago') where categoria in ('vestido','mono') and nombre ~ '\ymurcielago\y';
update products set nombre = regexp_replace(nombre, '\ypedreria\y', 'pedrería') where categoria in ('vestido','mono') and nombre ~ '\ypedreria\y';
update products set nombre = regexp_replace(nombre, '\yesciote\y', 'escote') where categoria in ('vestido','mono') and nombre ~ '\yesciote\y';
update products set nombre = regexp_replace(nombre, '\yecote\y', 'escote') where categoria in ('vestido','mono') and nombre ~ '\yecote\y';
update products set nombre = regexp_replace(nombre, '\ycin\y', 'con') where categoria in ('vestido','mono') and nombre ~ '\ycin\y';
update products set nombre = regexp_replace(nombre, '\ylardo\y', 'largo') where categoria in ('vestido','mono') and nombre ~ '\ylardo\y';
update products set nombre = regexp_replace(nombre, '\ygliter\y', 'glitter') where categoria in ('vestido','mono') and nombre ~ '\ygliter\y';
update products set nombre = regexp_replace(nombre, '\ygitter\y', 'glitter') where categoria in ('vestido','mono') and nombre ~ '\ygitter\y';
update products set nombre = regexp_replace(nombre, '\yabuchado\y', 'abullonado') where categoria in ('vestido','mono') and nombre ~ '\yabuchado\y';
update products set nombre = regexp_replace(nombre, '\ydecubiertos\y', 'descubiertos') where categoria in ('vestido','mono') and nombre ~ '\ydecubiertos\y';
update products set nombre = regexp_replace(nombre, '\ycetalle\y', 'detalle') where categoria in ('vestido','mono') and nombre ~ '\ycetalle\y';
update products set nombre = regexp_replace(nombre, '\ydrapeda\y', 'drapeada') where categoria in ('vestido','mono') and nombre ~ '\ydrapeda\y';
update products set nombre = regexp_replace(nombre, '\ytunica\y', 'túnica') where categoria in ('vestido','mono') and nombre ~ '\ytunica\y';
update products set nombre = regexp_replace(nombre, '\ysaten\y', 'satén') where categoria in ('vestido','mono') and nombre ~ '\ysaten\y';
update products set nombre = regexp_replace(nombre, '\ycordon\y', 'cordón') where categoria in ('vestido','mono') and nombre ~ '\ycordon\y';
update products set nombre = regexp_replace(nombre, '\ymetalica\y', 'metálica') where categoria in ('vestido','mono') and nombre ~ '\ymetalica\y';
update products set nombre = regexp_replace(nombre, '\ymetalico\y', 'metálico') where categoria in ('vestido','mono') and nombre ~ '\ymetalico\y';
update products set nombre = regexp_replace(nombre, '\yasimetrico\y', 'asimétrico') where categoria in ('vestido','mono') and nombre ~ '\yasimetrico\y';
update products set nombre = regexp_replace(nombre, '\yasimetrica\y', 'asimétrica') where categoria in ('vestido','mono') and nombre ~ '\yasimetrica\y';
update products set nombre = regexp_replace(nombre, '\ycaidos\y', 'caídos') where categoria in ('vestido','mono') and nombre ~ '\ycaidos\y';
update products set nombre = regexp_replace(nombre, '\ylineas\y', 'líneas') where categoria in ('vestido','mono') and nombre ~ '\ylineas\y';
update products set nombre = replace(nombre, 'cIntas', 'cintas') where categoria in ('vestido','mono') and nombre like '%cIntas%';
update products set nombre = regexp_replace(nombre, '\yatras\y', 'atrás') where categoria in ('vestido','mono') and nombre ~ '\yatras\y';
update products set nombre = replace(nombre, 'largo e terciopelo', 'largo de terciopelo') where categoria in ('vestido','mono') and nombre like '%largo e terciopelo%';
update products set nombre = regexp_replace(nombre, 'escote v\y', 'escote V') where categoria in ('vestido','mono') and nombre ~ 'escote v\y';
update products set nombre = 'Vestido largo drapeado en el escote y la espalda' where categoria in ('vestido','mono') and nombre = 'Vestido largo drapeado en el escote y la';
