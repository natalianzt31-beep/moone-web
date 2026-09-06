-- Môone — senia_avisada/senia_avisada_fecha y saldo_pagado/saldo_pagado_fecha
-- ya existían en producción, creadas out-of-band (mencionadas como
-- pendientes en 20260928 y 20260936, pero nunca agregadas de verdad a una
-- migración). Ahora que el código las usa (confirmación de reserva y
-- marcar-saldo-pagado), quedan documentadas acá para que un clon nuevo del
-- proyecto tenga el esquema completo. IF NOT EXISTS: no cambia nada en la
-- base que ya las tiene.
alter table reservations add column if not exists senia_avisada boolean not null default false;
alter table reservations add column if not exists senia_avisada_fecha timestamptz;
alter table reservations add column if not exists saldo_pagado boolean not null default false;
alter table reservations add column if not exists saldo_pagado_fecha timestamptz;
