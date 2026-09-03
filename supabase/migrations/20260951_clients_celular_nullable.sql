-- Môone — clients.celular pasa a ser nullable.
--
-- Bug: las clientas que ingresan con Google (sin celular en los datos de
-- OAuth) se guardaban con celular = '' en ensureClientRow(). Como la
-- columna tiene un UNIQUE constraint, la segunda clienta de Google sin
-- celular chocaba contra la primera (celular = '' duplicado) y el insert
-- fallaba con 23502/23505, dejando a la usuaria con "No pudimos cargar
-- tu cuenta." en /mi-cuenta. Los NULL no colisionan entre sí bajo un
-- UNIQUE constraint, así que ahora se guarda null en vez de ''.

alter table clients alter column celular drop not null;
update clients set celular = null where celular = '';
