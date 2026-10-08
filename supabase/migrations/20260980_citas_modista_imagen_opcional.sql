-- La foto de referencia pasa a ser opcional en /turnos: a veces la clienta
-- todavía no tiene una imagen clara de lo que quiere y prefiere mostrarla
-- en persona.
alter table citas_modista alter column imagen_path drop not null;
