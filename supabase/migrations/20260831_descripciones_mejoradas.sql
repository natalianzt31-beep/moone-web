-- Môone — Descripciones web mejoradas del catálogo
-- Correr esto en Supabase → SQL Editor
--
-- Reescribe `descripcion_web` (la copia que se muestra en el sitio) para
-- las 228 descripciones únicas del catálogo: corrige errores de tipeo del
-- archivo original (acentos faltantes, "cin"/"con", "ecote"/"escote",
-- "lardo"/"largo", nombres propios en minúscula como "victoria vidarte" o
-- "mango", "v" sin mayúscula en "escote en V", una oración cortada, etc.)
-- y redacta cada una en un tono de copywriting de moda, sin agregar
-- características que no estuvieran ya en la descripción original.
--
-- Se actualiza por el texto de `descripcion` (la copia original, que se
-- repite igual entre variantes de color/talle de la misma prenda), así
-- que un solo UPDATE alcanza a todas las filas de esa prenda.

update products set descripcion_web = case descripcion
  when 'Sobre de fiesta con cadenita larga para colgar' then 'Sobre de fiesta con cadena larga desmontable, el complemento ideal para llevar cruzado o al hombro.'
  when 'Sandalias altas, súper cómodas y anatómicas para bailar toda la noche' then 'Sandalias de taco alto con plantilla anatómica, pensadas para acompañarte con comodidad toda la noche.'
  when 'Sandalias bajas, súper cómodas y anatómicas para bailar toda la noche' then 'Sandalias bajas con plantilla anatómica, ideales para moverte con total comodidad toda la noche.'

  when 'Vestido largo con lentejuelas y aberturas' then 'Vestido largo cubierto de lentejuelas con aberturas laterales que estilizan la silueta, ideal para brillar toda la noche.'
  when 'Vestido largo falda corte princesa escote con tul azul' then 'Vestido largo de falda corte princesa con escote en tul azul, una propuesta romántica para una velada elegante.'
  when 'Vestido largo con corset Victoria Vidarte' then 'Vestido largo con corset Victoria Vidarte, una pieza statement con estructura impecable para ocasiones especiales.'
  when 'Vestido corto tipo tunica en saten con cordon de strass' then 'Vestido corto tipo túnica en satén, ceñido con un cordón de strass en la cintura, versátil y lleno de estilo.'
  when 'Vestido largo, escote cin transparencias tajo pronunciado' then 'Vestido largo con escote de transparencias sutiles y tajo pronunciado, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo ecote en V Victoria Vidarte' then 'Vestido largo con escote en V, firma Victoria Vidarte, ideal para una velada elegante.'
  when 'Vestido corto falso corset falda drapeada' then 'Vestido corto con efecto corset y falda drapeada de caída fluida, ideal para lucir con confianza.'
  when 'Vestido corto con detalles en dorado y brillos en el cuello' then 'Vestido corto con apliques dorados y brillos en el cuello, una pieza versátil y llena de estilo.'
  when 'Vestido corto tela metalica fruncido en los costados' then 'Vestido corto en tela metalizada con fruncido en los costados, una opción chic para salir de noche.'
  when 'Vestido largo escote con transparencias y tajo pronunciado' then 'Vestido largo con escote de transparencias sutiles y tajo pronunciado, una pieza statement para ocasiones especiales.'
  when 'Vestido largo con lentejuelas en el busto' then 'Vestido largo con lentejuelas en el busto, perfecto para una noche inolvidable.'
  when 'Vestido corto con lentejuelas azules' then 'Vestido corto cubierto de lentejuelas azules, perfecto para una fiesta con actitud.'
  when 'Vestido largo mangas largas' then 'Vestido largo de mangas largas, ideal para una velada elegante.'
  when 'Vestido largo escote V frente asimetrico' then 'Vestido largo con escote en V y frente asimétrico, una pieza statement para ocasiones especiales.'
  when 'Vestido corto falda acampanada' then 'Vestido corto de falda acampanada, una pieza versátil y llena de estilo.'
  when 'Vestido corto fruncido con escote' then 'Vestido corto con fruncido en el escote, perfecto para una fiesta con actitud.'
  when 'Vestido largo con pliegue en el escote y tajo' then 'Vestido largo con pliegue en el escote y tajo lateral, ideal para una velada elegante.'
  when 'Vestido largo corte sirena de un hombro con lentejuelas' then 'Vestido largo corte sirena de un hombro, cubierto de lentejuelas, una pieza statement para ocasiones especiales.'
  when 'Vestido largo drapeado con cintas para atar' then 'Vestido largo drapeado con cintas para atar, perfecto para una noche inolvidable.'
  when 'Vestido rosa con volados en la falda' then 'Vestido corto rosa con volados en la falda, perfecto para una fiesta con actitud.'
  when 'Vestido corto con cintas para fruncir' then 'Vestido corto con cintas para fruncir a medida, una opción chic para salir de noche.'
  when 'Vestido rosa coral asimetrico cruzado atras' then 'Vestido corto rosa coral, asimétrico y cruzado en la espalda, ideal para lucir con confianza.'
  when 'Vestido corto con lentejuelas' then 'Vestido corto cubierto de lentejuelas, una pieza versátil y llena de estilo.'
  when 'Vestido largo falso corset falda drapeada' then 'Vestido largo con efecto corset y falda drapeada de caída fluida, una silueta pensada para brillar toda la noche.'
  when 'Vestido tela engomada con cuatro aberturas adelante' then 'Vestido largo en tela engomada con aberturas laterales al frente, ideal para una velada elegante.'
  when 'Vestido largo brillos con espalda cruzada' then 'Vestido largo con brillos y espalda cruzada, una pieza statement para ocasiones especiales.'
  when 'Vestido corset corte sirena con lentejuelas' then 'Vestido largo con corset y corte sirena, cubierto de lentejuelas, perfecto para una noche inolvidable.'
  when 'Vestido corte princesa esciote v con cintas para atar' then 'Vestido largo corte princesa con escote en V y cintas para atar, una silueta pensada para brillar toda la noche.'
  when 'Vestido corto straples' then 'Vestido corto strapless, una opción chic para salir de noche.'
  when 'Vestido corto escote drapeado con cintas para atar' then 'Vestido corto con escote drapeado y cintas para atar, una pieza versátil y llena de estilo.'
  when 'Vestido corto con lentejuelas de mangas largas' then 'Vestido corto de mangas largas cubierto de lentejuelas, perfecto para una fiesta con actitud.'
  when 'Vestido tela con glitter falda acampanada' then 'Vestido corto en tela con glitter y falda acampanada, una opción chic para salir de noche.'
  when 'Vestido con brillos abdomen expuesto' then 'Vestido largo con brillos y recorte en la cintura, una pieza statement para ocasiones especiales.'
  when 'Vestido de brillos escote asimetrico' then 'Vestido largo de brillos con escote asimétrico, perfecto para una noche inolvidable.'
  when 'Vestido corto con cuatro aberturas en el frente' then 'Vestido corto con aberturas laterales al frente, perfecto para una fiesta con actitud.'
  when 'Vestido largo falda acampanada y escote en V' then 'Vestido largo de falda acampanada y escote en V, ideal para una velada elegante.'
  when 'Vestido corte sirena con transparencias en el escote' then 'Vestido largo corte sirena con transparencias sutiles en el escote, una pieza statement para ocasiones especiales.'
  when 'Vestido largo con detalles en el top falda sirena' then 'Vestido largo con top trabajado en detalles y falda sirena, perfecto para una noche inolvidable.'
  when 'Vestido largo mangas tipo capa' then 'Vestido largo con mangas tipo capa, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo Victoria Vidarte escote cerrado al cuello con lazo' then 'Vestido largo Victoria Vidarte con escote cerrado al cuello y lazo, ideal para una velada elegante.'
  when 'Vestido de terciopelo con perlas y espalda descubierta' then 'Vestido largo de terciopelo con aplique de perlas y espalda descubierta, una pieza statement para ocasiones especiales.'
  when 'Vestido corto con corset Victoria Vidarte' then 'Vestido corto con corset Victoria Vidarte, una pieza versátil y llena de estilo.'
  when 'Vestido largo tipo corset brilloso' then 'Vestido largo tipo corset en tela brillosa, una silueta pensada para brillar toda la noche.'
  when 'Vestido corto de terciopelo escote en V' then 'Vestido corto de terciopelo con escote en V, una opción chic para salir de noche.'
  when 'Vestido corto falso corset fruncido en la falda' then 'Vestido corto con efecto corset y fruncido en la falda, ideal para lucir con confianza.'
  when 'Vestido largo verde agua de un hombro con lentejuelas' then 'Vestido largo verde agua, de un hombro y cubierto de lentejuelas, perfecto para una noche inolvidable.'
  when 'Vestido largo escote drapeado, espalda ajustable Victoria Vidarte' then 'Vestido largo Victoria Vidarte con escote drapeado y espalda ajustable, ideal para una velada elegante.'
  when 'Vestido largo escote con transparencias' then 'Vestido largo con escote de transparencias sutiles, una pieza statement para ocasiones especiales.'
  when 'Vestido largo corte sirena hombros descubiertos' then 'Vestido largo corte sirena con hombros descubiertos, perfecto para una noche inolvidable.'
  when 'Vestido corto strapless' then 'Vestido corto strapless, ideal para destacar en cualquier fiesta.'
  when 'Vestido tela negra con lentejuelas verdes y azules' then 'Vestido largo en tela negra con lentejuelas verdes y azules, ideal para una velada elegante.'
  when 'Vestido largo de terciopelo con perlas en la espalda' then 'Vestido largo de terciopelo con aplique de perlas en la espalda, una pieza statement para ocasiones especiales.'
  when 'Vestido largo con mangas tipo capa' then 'Vestido largo con mangas tipo capa, perfecta para una noche inolvidable.'
  when 'Vestido escote v falda corte princesa' then 'Vestido corto con escote en V y falda corte princesa, perfecto para una fiesta con actitud.'
  when 'Vestido escote V tipo saten' then 'Vestido largo con escote en V en tela tipo satén, ideal para una velada elegante.'
  when 'Vestido largo con lentejuelas y aberturas en las costillas' then 'Vestido largo cubierto de lentejuelas con aberturas laterales a la altura de las costillas, una pieza statement para ocasiones especiales.'
  when 'Vestido lardo falda asimetrica' then 'Vestido largo de falda asimétrica, perfecta para una noche inolvidable.'
  when 'Vestido largo tela con brillos escote en V' then 'Vestido largo en tela con brillos y escote en V, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo escote en V Victoria Vidarte' then 'Vestido largo con escote en V, firma Victoria Vidarte, una pieza statement para ocasiones especiales.'
  when 'Vestido largo tela metalica azul' then 'Vestido largo en tela metalizada azul, perfecta para una noche inolvidable.'
  when 'Vestido corto tela terciopelo escote drapeado' then 'Vestido corto de terciopelo con escote drapeado, perfecto para una fiesta con actitud.'
  when 'Vestido corto corset, tela en encaje y falda fruncida' then 'Vestido corto con corset en encaje y falda fruncida, una opción chic para salir de noche.'
  when 'Vestido lardo de un hombro con detalles en strass' then 'Vestido largo de un hombro con detalles en strass, perfecta para una noche inolvidable.'
  when 'Vestido corto de lentejuelas con mangas largas.' then 'Vestido corto cubierto de lentejuelas con mangas largas, perfecto para una fiesta con actitud.'
  when 'Vestido corto falso corset.' then 'Vestido corto con efecto corset, una opción chic para salir de noche.'
  when 'Vestido largo con brillos y tajo en la pierna' then 'Vestido largo con brillos y tajo en la pierna, una pieza statement para ocasiones especiales.'
  when 'Vestido corto strapless con flor de mostacillas' then 'Vestido corto strapless con aplique floral de mostacillas, una pieza versátil y llena de estilo.'
  when 'Vestido con lentejuelas cruzado en la espalda' then 'Vestido largo cubierto de lentejuelas con espalda cruzada, una silueta pensada para brillar toda la noche.'
  when 'Vestido tipo sirena con brillos en el busto' then 'Vestido largo tipo sirena con brillos en el busto, ideal para una velada elegante.'
  when 'Vestido con lentejuelas colgantes' then 'Vestido largo con lentejuelas colgantes de movimiento, una pieza statement para ocasiones especiales.'
  when 'Vestido irregular, una manga, cavado en abdomen, tela metalizada' then 'Vestido largo asimétrico de una manga, con recorte en la cintura, en tela metalizada, perfecta para una noche inolvidable.'
  when 'Vestido largo, lentejuelas cobrizas, tajo' then 'Vestido largo con lentejuelas cobrizas y tajo lateral, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo tipo corset con tajo en la pierna Victoria Vidarte' then 'Vestido largo Victoria Vidarte tipo corset con tajo en la pierna, ideal para una velada elegante.'
  when 'Vestido largo drapeado en el escote y la' then 'Vestido largo drapeado en el escote y la espalda, perfecta para una noche inolvidable.'
  when 'Vestido corto fruncido con brillos' then 'Vestido corto con fruncido y brillos, perfecto para una fiesta con actitud.'
  when 'Vestido corto espalda descubierta' then 'Vestido corto de espalda descubierta, una opción chic para salir de noche.'
  when 'Vestido asimetrico con aro en hombro y cadera' then 'Vestido corto asimétrico con detalle de aro en el hombro y la cadera, ideal para lucir con confianza.'
  when 'Vestido corto mangas largas y falda plisada' then 'Vestido corto de mangas largas con falda plisada de movimiento, una pieza versátil y llena de estilo.'
  when 'Vestido corto strapless con brillos' then 'Vestido corto strapless con brillos, perfecto para una fiesta con actitud.'
  when 'Vestido corto straples con lazo' then 'Vestido corto strapless con lazo, una opción chic para salir de noche.'
  when 'Vestido largo lentejuelas escote asimetrico' then 'Vestido largo cubierto de lentejuelas con escote asimétrico, una pieza statement para ocasiones especiales.'
  when 'Vestido largo escote en V con cuatro aberturas al frente' then 'Vestido largo con escote en V y aberturas laterales al frente, perfecta para una noche inolvidable.'
  when 'Vestido plata tela metalica con detalles al frente' then 'Vestido largo plateado en tela metalizada con detalles al frente, una silueta pensada para brillar toda la noche.'
  when 'Vestido corto mangas murcielago' then 'Vestido corto de mangas murciélago, una opción chic para salir de noche.'
  when 'Vestido corto adelante, largo atras con detalles dorados' then 'Vestido corto adelante y largo atrás, con detalles dorados, una pieza statement para ocasiones especiales.'
  when 'Vestido corto con brillos , hombros caidos' then 'Vestido corto con brillos y hombros caídos, en clave romántica, una pieza versátil y llena de estilo.'
  when 'Vestido corto escote en V con cinta para atar el cuello' then 'Vestido corto con escote en V y cinta para atar al cuello, perfecto para una fiesta con actitud.'
  when 'Mono corto con mostacillas en los hombros' then 'Mono corto con aplique de mostacillas en los hombros, ideal para lucir con confianza.'
  when 'Mono corto con escote cuadrado' then 'Mono corto con escote cuadrado, una pieza versátil y llena de estilo.'
  when 'Vestido corto con lentejuelas y mostacillas' then 'Vestido corto con lentejuelas y mostacillas, perfecto para una fiesta con actitud.'
  when 'Vestido corto con mangas abullonadas de tul' then 'Vestido corto con mangas abullonadas de tul, una opción chic para salir de noche.'
  when 'Vestido corto con perlas en el cuello y mangas murcielago' then 'Vestido corto con aplique de perlas en el cuello y mangas murciélago, ideal para lucir con confianza.'
  when 'Vestido con falda de tul y cuello con brillos' then 'Vestido largo de falda en tul y cuello con brillos, perfecta para una noche inolvidable.'
  when 'Vestido corto falso corset con falda drapeda' then 'Vestido corto con efecto corset y falda drapeada, perfecto para una fiesta con actitud.'
  when 'Vestido largo falso corset con tajo en la pierna' then 'Vestido largo con efecto corset y tajo en la pierna, ideal para una velada elegante.'
  when 'Vestido largo con corset y transparencias' then 'Vestido largo con corset y transparencias sutiles, una pieza statement para ocasiones especiales.'
  when 'Vestido largo con brillos, pedreria y falda corte princesa' then 'Vestido largo con brillos, pedrería y falda corte princesa, perfecta para una noche inolvidable.'
  when 'Vestido largo escote en V con lentejuelas doradas' then 'Vestido largo con escote en V y lentejuelas doradas, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo corte sirena con cola' then 'Vestido largo corte sirena con cola, ideal para una velada elegante.'
  when 'Vestido corto falda con flores blancas' then 'Vestido corto con falda de flores blancas, ideal para lucir con confianza.'
  when 'Vestido de saten con corte en la pierna' then 'Vestido largo de satén con corte en la pierna, perfecta para una noche inolvidable.'
  when 'Vestido largo corte sirena espalda con transparencias y pedreria' then 'Vestido largo corte sirena con espalda de transparencias y pedrería, una silueta pensada para brillar toda la noche.'
  when 'Vestido corto con corset en encaje y falda fruncida' then 'Vestido corto con corset en encaje y falda fruncida, ideal para lucir con confianza.'
  when 'Vestido largo falda de tul con brillos' then 'Vestido largo de falda en tul con brillos, perfecta para una noche inolvidable.'
  when 'Vestido largo con lazo en el cuello Victoria Vidarte' then 'Vestido largo Victoria Vidarte con lazo en el cuello, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo con corset nude y transparencias' then 'Vestido largo con corset nude y transparencias sutiles, ideal para una velada elegante.'
  when 'Vestido largo tela con brillos mangas largas de tul' then 'Vestido largo en tela con brillos y mangas largas de tul, una pieza statement para ocasiones especiales.'
  when 'Vestido largo escote cruzado' then 'Vestido largo con escote cruzado, perfecta para una noche inolvidable.'
  when 'Vestido corto una manga, terciopelo negro con brillos, marca Mango' then 'Vestido corto de una manga en terciopelo negro con brillos, de Mango, perfecto para una fiesta con actitud.'
  when 'Vestido fruncido en el costado y abertura en abdomen' then 'Vestido largo con fruncido en el costado y abertura en la cintura, ideal para una velada elegante.'
  when 'Vestido tela engomada con aberturas y detalle en strass adelante' then 'Vestido largo en tela engomada con aberturas y detalle en strass al frente, una pieza statement para ocasiones especiales.'
  when 'Vestido con detalle azul en el bustier' then 'Vestido largo con detalle azul en el bustier, perfecta para una noche inolvidable.'
  when 'Vestido de un hombro con fruncido y transparencias' then 'Vestido largo de un hombro con fruncido y transparencias sutiles, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo con transparencias en abdomen y bajo de falda' then 'Vestido largo con transparencias sutiles en la cintura y el bajo de la falda, ideal para una velada elegante.'
  when 'Vestido con lentejuelas abierto en frente y espalda' then 'Vestido largo cubierto de lentejuelas, abierto al frente y en la espalda, una pieza statement para ocasiones especiales.'
  when 'Mono talle M, con aberturas y top de lentejuelas' then 'Mono con aberturas y top de lentejuelas, talle M, perfecta para una noche inolvidable.'
  when 'Mono strapless con volados' then 'Mono strapless con volados, una silueta pensada para brillar toda la noche.'
  when 'Mono de un hombro pantalon acampanado' then 'Mono de un hombro con pantalón acampanado, ideal para una velada elegante.'
  when 'Vestido con detalles de strass escote en V' then 'Vestido largo con detalles de strass y escote en V, una pieza statement para ocasiones especiales.'
  when 'Vestido con corset falda sirena' then 'Vestido largo con corset y falda sirena, perfecta para una noche inolvidable.'
  when 'Vestido con corset y falda drapeada' then 'Vestido largo con corset y falda drapeada de caída fluida, una silueta pensada para brillar toda la noche.'
  when 'Mono con bolado al frente pantalon acampanado' then 'Mono con volado al frente y pantalón acampanado, ideal para una velada elegante.'
  when 'Mono con hombros caidos' then 'Mono con hombros caídos, en clave romántica, una pieza statement para ocasiones especiales.'
  when 'Vestido blanco cuello halter' then 'Vestido largo blanco con cuello halter, perfecta para una noche inolvidable.'
  when 'Vestido corto fruncido con mangas largas' then 'Vestido corto con fruncido y mangas largas, perfecto para una fiesta con actitud.'
  when 'Vestido corto falda princesa con lentejuelas tornasol' then 'Vestido corto de falda princesa con lentejuelas tornasol, una opción chic para salir de noche.'
  when 'Vestido con mangas tipo capa' then 'Vestido largo con mangas tipo capa, una pieza statement para ocasiones especiales.'
  when 'Vestido con brillos cruzado atras' then 'Vestido largo con brillos y cruce en la espalda, perfecta para una noche inolvidable.'
  when 'Vestido falso corset amarillo' then 'Vestido largo amarillo con efecto corset, una silueta pensada para brillar toda la noche.'
  when 'Vestido con corset y falda corte princesa' then 'Vestido largo con corset y falda corte princesa, ideal para una velada elegante.'
  when 'Vestido largo con lentejuelas colgantes' then 'Vestido largo con lentejuelas colgantes de movimiento, una pieza statement para ocasiones especiales.'
  when 'Vestido corto tela con brillos falda fruncida atras' then 'Vestido corto en tela con brillos y falda fruncida en la espalda, una pieza versátil y llena de estilo.'
  when 'Vestido naranja drapeado con cintas para atar' then 'Vestido largo naranja drapeado con cintas para atar, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo, tajo y tiras en las espalda' then 'Vestido largo con tajo y tiras cruzadas en la espalda, ideal para una velada elegante.'
  when 'Vestido largo tajo y cintas para atar escote drapeado' then 'Vestido largo con tajo, escote drapeado y cintas para atar, una pieza statement para ocasiones especiales.'
  when 'Vestido corto dorado metalizado, irregular, un hombro' then 'Vestido corto dorado metalizado, de corte irregular y un hombro, perfecto para una fiesta con actitud.'
  when 'Vestido dorado, escote abuchado, drapeado de lado' then 'Vestido largo dorado con escote abullonado y drapeado lateral, ideal para una velada elegante.'
  when 'Vestido de tela con glitter con cIntas para atar' then 'Vestido largo en tela con glitter y cintas para atar, una pieza statement para ocasiones especiales.'
  when 'Vestido con brillos y aberturas en abdomen y espalda' then 'Vestido largo con brillos y aberturas en la cintura y la espalda, perfecta para una noche inolvidable.'
  when 'Vestido dorado tela metalica con transparencias' then 'Vestido largo dorado en tela metalizada con transparencias sutiles, una silueta pensada para brillar toda la noche.'
  when 'Vestido beige pollera pantalón' then 'Vestido corto beige tipo pollera pantalón, una opción chic para salir de noche.'
  when 'Vestido corto perlado, tiras anchas en espalda, tela brillante' then 'Vestido corto perlado en tela brillante, con tiras anchas en la espalda, ideal para lucir con confianza.'
  when 'Vestido largo beige, corset y tajo, tiras en espalda' then 'Vestido largo beige con corset, tajo y tiras en la espalda, perfecta para una noche inolvidable.'
  when 'Vestido largo, beige, espalda abierta, escote abuchado, tajo' then 'Vestido largo beige de espalda abierta, escote abullonado y tajo, una silueta pensada para brillar toda la noche.'
  when 'Veatido corto falda princesa con lentejuelas tornasol' then 'Vestido corto de falda princesa con lentejuelas tornasol, perfecto para una fiesta con actitud.'
  when 'Vestido largo con breteles torneados de tela brillosa' then 'Vestido largo con breteles torneados en tela brillosa, una pieza statement para ocasiones especiales.'
  when 'Vestido engomado con cuatro aberturas en el frente' then 'Vestido largo engomado con aberturas laterales al frente, perfecta para una noche inolvidable.'
  when 'Vestido corto detalle cruzado en escote' then 'Vestido corto con detalle cruzado en el escote, una opción chic para salir de noche.'
  when 'Vestido largo con aberturas y detalle en stras' then 'Vestido largo con aberturas y detalle en strass, perfecta para una noche inolvidable.'
  when 'Vestidp rojo metalizado con frunce en escote' then 'Vestido largo rojo metalizado con frunce en el escote, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo tela de lineas con cintas para atar' then 'Vestido largo en tela a rayas con cintas para atar, ideal para una velada elegante.'
  when 'Vestido largo con aberturas y lentejuelas en busto' then 'Vestido largo con aberturas y lentejuelas en el busto, una pieza statement para ocasiones especiales.'
  when 'Vestido largo falso corset' then 'Vestido largo con efecto corset, perfecta para una noche inolvidable.'
  when 'Vetido corto cetalle cruzado en escote' then 'Vestido corto con detalle cruzado en el escote, perfecto para una fiesta con actitud.'
  when 'Vestido con corset y falda con gliter' then 'Vestido largo con corset y falda con glitter, una pieza statement para ocasiones especiales.'
  when 'Vestido largo corte princesa Victoria Vidarte' then 'Vestido largo corte princesa, firma Victoria Vidarte, perfecta para una noche inolvidable.'
  when 'Vestido largo, falso corset, escote drapeado y tajo profundo' then 'Vestido largo con efecto corset, escote drapeado y tajo profundo, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo con hombros y espalda descubiertos aplique en el cuello' then 'Vestido largo con hombros y espalda descubiertos y aplique en el cuello, una pieza statement para ocasiones especiales.'
  when 'Vestido largo falda drapeada' then 'Vestido largo de falda drapeada con caída fluida, perfecta para una noche inolvidable.'
  when 'Vestido largo e terciopelo con los hombros decubiertos' then 'Vestido largo de terciopelo con hombros descubiertos, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo drapeado en la espalda y el escote Victoria Vidarte' then 'Vestido largo Victoria Vidarte, drapeado en la espalda y el escote, ideal para una velada elegante.'
  when 'Vestido largo de tela negra con lentejuelas verdes y azules' then 'Vestido largo en tela negra con lentejuelas verdes y azules, una pieza statement para ocasiones especiales.'
  when 'Vestido largo espalda descubierta con lazo Victoria Vidarte' then 'Vestido largo Victoria Vidarte de espalda descubierta con lazo, perfecta para una noche inolvidable.'
  when 'Vestido corto escote V falda acampanada' then 'Vestido corto con escote en V y falda acampanada, una opción chic para salir de noche.'
  when 'Vestido largo escote V tela tipo saten' then 'Vestido largo con escote en V en tela tipo satén, una pieza statement para ocasiones especiales.'
  when 'Vestido largo escote halter tela tipo saten' then 'Vestido largo con escote halter en tela tipo satén, perfecta para una noche inolvidable.'
  when 'Vestido largo escote V con lentejuelas' then 'Vestido largo con escote en V y lentejuelas, una silueta pensada para brillar toda la noche.'
  when 'Vestido celeste corto strapless' then 'Vestido corto celeste strapless, ideal para lucir con confianza.'
  when 'Vestido largo falda asimetrica' then 'Vestido largo de falda asimétrica, perfecta para una noche inolvidable.'
  when 'Vestido largo falda corte princesa azul oscuro' then 'Vestido largo azul oscuro de falda corte princesa, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo con lentejuelas en la parte superior' then 'Vestido largo con lentejuelas en la parte superior, ideal para una velada elegante.'
  when 'Vestido largo ecote cruzado en V' then 'Vestido largo con escote cruzado en V, una pieza statement para ocasiones especiales.'
  when 'Vestido azul metalico con aberturas en el frente' then 'Vestido largo azul metalizado con aberturas al frente, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo con abertura en abdomen y lentejuelas en el busto' then 'Vestido largo con abertura en la cintura y lentejuelas en el busto, ideal para una velada elegante.'
  when 'Vestido aterciopelado con escote drapeado' then 'Vestido corto aterciopelado con escote drapeado, ideal para lucir con confianza.'
  when 'Vestido escote en V con falda acampanada' then 'Vestido corto con escote en V y falda acampanada, una pieza versátil y llena de estilo.'
  when 'Vestido larga falda de gasa con detalles arriba' then 'Vestido largo de falda en gasa con detalles en la parte superior, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo, escote en V mangas con volados' then 'Vestido largo con escote en V y mangas con volados, una pieza statement para ocasiones especiales.'
  when 'Vestido largo drapeado en el escote y la espalda Victoria Vidarte' then 'Vestido largo Victoria Vidarte, drapeado en el escote y la espalda, ideal para una velada elegante.'
  when 'Vestido largo plateado, con faja y escote, tela plisada' then 'Vestido largo plateado en tela plisada, con faja y escote trabajado, una pieza statement para ocasiones especiales.'
  when 'Vestido largo tela metalica con transparencias' then 'Vestido largo en tela metalizada con transparencias sutiles, ideal para una velada elegante.'
  when 'Vestido corto con lentejuelas y escote con transparencias' then 'Vestido corto con lentejuelas y escote de transparencias sutiles, ideal para lucir con confianza.'
  when 'Vestido largo con lentejuelas en dorado' then 'Vestido largo con lentejuelas doradas, perfecta para una noche inolvidable.'
  when 'Vestido corto falda con lentejuelas' then 'Vestido corto de falda con lentejuelas, perfecto para una fiesta con actitud.'
  when 'Vestido rojo falda de gasa roja' then 'Vestido corto rojo de falda en gasa, una opción chic para salir de noche.'
  when 'Vestido largo tela plisada' then 'Vestido largo en tela plisada de movimiento, una pieza statement para ocasiones especiales.'
  when 'Mono largo tela plisada' then 'Mono largo en tela plisada de movimiento, perfecta para una noche inolvidable.'
  when 'Vestido fruncido y con abertura en el costado' then 'Vestido largo con fruncido y abertura en el costado, una silueta pensada para brillar toda la noche.'
  when 'Vestido fruncido con transparencias en hombros abdomen y falda' then 'Vestido largo con fruncido y transparencias sutiles en hombros, cintura y falda, ideal para una velada elegante.'
  when 'Vestido engomado con aberturas y detalle en strass' then 'Vestido largo engomado con aberturas y detalle en strass, una pieza statement para ocasiones especiales.'
  when 'Vestido largo con detalles de strass escote en V' then 'Vestido largo con detalles de strass y escote en V, una silueta pensada para brillar toda la noche.'
  when 'Mono blanco straples con volado' then 'Mono blanco strapless con volado, ideal para una velada elegante.'
  when 'Mono clanco de un hombro patalon acampanado' then 'Mono blanco de un hombro con pantalón acampanado, una pieza statement para ocasiones especiales.'
  when 'Vestido fruncido con mangas largas' then 'Vestido corto con fruncido y mangas largas, una pieza versátil y llena de estilo.'
  when 'Vestido dorado, cubierto de lentejuelas doradas cuadradas' then 'Vestido largo dorado, cubierto de lentejuelas doradas cuadradas, ideal para una velada elegante.'
  when 'Vestido largo tela con gitter para atar' then 'Vestido largo en tela con glitter y cintas para atar, perfecta para una noche inolvidable.'
  when 'Vestido tela metalica con transparencias' then 'Vestido largo en tela metalizada con transparencias sutiles, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo con brillos mangas murcielago' then 'Vestido largo con brillos y mangas murciélago, una pieza statement para ocasiones especiales.'
  when 'Vestido escote V falda acampanada' then 'Vestido largo con escote en V y falda acampanada, perfecta para una noche inolvidable.'
  when 'Vestido tela con brillos detalles en el bustier' then 'Vestido largo en tela con brillos y detalles en el bustier, una silueta pensada para brillar toda la noche.'
  when 'Vestido de un hombro con volados' then 'Vestido largo de un hombro con volados, ideal para una velada elegante.'
  when 'Vestido largo con corset y falda drapeada' then 'Vestido largo con corset y falda drapeada de caída fluida, una pieza statement para ocasiones especiales.'
  when 'Vestido larga falda de tul con lentejuelas arriba' then 'Vestido largo de falda en tul con lentejuelas en la parte superior, una pieza statement para ocasiones especiales.'
  when 'Vestido de novia con detalles en la parte superior' then 'Vestido de novia con detalles trabajados en la parte superior, perfecto para una noche inolvidable.'
  when 'Vestido corto fruncido mangas largas' then 'Vestido corto con fruncido y mangas largas, perfecto para una fiesta con actitud.'
  when 'Vestido largo estampado floreado y mangas con flores' then 'Vestido largo con estampado floral y mangas bordadas con flores, ideal para una velada elegante.'
  when 'Vestido largo verde agua de un hombro con volados' then 'Vestido largo verde agua, de un hombro y con volados, perfecta para una noche inolvidable.'
  when 'Vestido escote V brillos mangas murcielago' then 'Vestido largo con escote en V, brillos y mangas murciélago, una silueta pensada para brillar toda la noche.'
  when 'Vestido celeste largo falso corset con escote y falda drapeado' then 'Vestido largo celeste con efecto corset, escote y falda drapeados, ideal para una velada elegante.'
  when 'Vestido largo escote en V' then 'Vestido largo con escote en V, una pieza statement para ocasiones especiales.'
  when 'Vestido largo falda con volados' then 'Vestido largo de falda con volados, perfecta para una noche inolvidable.'
  when 'Vestido largo falda en gasa y escote con detalles' then 'Vestido largo de falda en gasa y escote con detalles trabajados, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo falda plisada con capa' then 'Vestido largo de falda plisada de movimiento con capa, ideal para una velada elegante.'
  when 'Vestido largo de un hombro' then 'Vestido largo de un hombro, perfecta para una noche inolvidable.'
  when 'Vestido con detalles dorados y falda de tul' then 'Vestido largo con detalles dorados y falda en tul, ideal para una velada elegante.'
  when 'Vestido con detalles en la parte superior y falda de gasa' then 'Vestido largo con detalles en la parte superior y falda en gasa, una pieza statement para ocasiones especiales.'
  when 'Vestido largo falda princesa con volados' then 'Vestido largo de falda princesa con volados, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo falda princesa manga con volados' then 'Vestido largo de falda princesa con mangas de volados, ideal para una velada elegante.'
  when 'Vestido largo falda corte princesa con detalles al frente' then 'Vestido largo de falda corte princesa con detalles al frente, una pieza statement para ocasiones especiales.'
  when 'Vestido largo falda corte princesa con volados' then 'Vestido largo de falda corte princesa con volados, perfecta para una noche inolvidable.'
  when 'Vestido largo escote en V falda corte princesa' then 'Vestido largo con escote en V y falda corte princesa, ideal para una velada elegante.'
  when 'Vestido largo con cintas para atar' then 'Vestido largo con cintas para atar, una pieza statement para ocasiones especiales.'
  when 'Vestido escote V' then 'Vestido largo con escote en V, una silueta pensada para brillar toda la noche.'
  when 'Vestido largo tela plisada de mangas largas' then 'Vestido largo en tela plisada de movimiento y mangas largas, una pieza statement para ocasiones especiales.'
  when 'Vestido largo tela plisada mangas largas.' then 'Vestido largo en tela plisada de movimiento, mangas largas, perfecta para una noche inolvidable.'
  else descripcion_web
end
where descripcion in (
  'Sobre de fiesta con cadenita larga para colgar',
  'Sandalias altas, súper cómodas y anatómicas para bailar toda la noche',
  'Sandalias bajas, súper cómodas y anatómicas para bailar toda la noche',
  'Vestido largo con lentejuelas y aberturas',
  'Vestido largo falda corte princesa escote con tul azul',
  'Vestido largo con corset Victoria Vidarte',
  'Vestido corto tipo tunica en saten con cordon de strass',
  'Vestido largo, escote cin transparencias tajo pronunciado',
  'Vestido largo ecote en V Victoria Vidarte',
  'Vestido corto falso corset falda drapeada',
  'Vestido corto con detalles en dorado y brillos en el cuello',
  'Vestido corto tela metalica fruncido en los costados',
  'Vestido largo escote con transparencias y tajo pronunciado',
  'Vestido largo con lentejuelas en el busto',
  'Vestido corto con lentejuelas azules',
  'Vestido largo mangas largas',
  'Vestido largo escote V frente asimetrico',
  'Vestido corto falda acampanada',
  'Vestido corto fruncido con escote',
  'Vestido largo con pliegue en el escote y tajo',
  'Vestido largo corte sirena de un hombro con lentejuelas',
  'Vestido largo drapeado con cintas para atar',
  'Vestido rosa con volados en la falda',
  'Vestido corto con cintas para fruncir',
  'Vestido rosa coral asimetrico cruzado atras',
  'Vestido corto con lentejuelas',
  'Vestido largo falso corset falda drapeada',
  'Vestido tela engomada con cuatro aberturas adelante',
  'Vestido largo brillos con espalda cruzada',
  'Vestido corset corte sirena con lentejuelas',
  'Vestido corte princesa esciote v con cintas para atar',
  'Vestido corto straples',
  'Vestido corto escote drapeado con cintas para atar',
  'Vestido corto con lentejuelas de mangas largas',
  'Vestido tela con glitter falda acampanada',
  'Vestido con brillos abdomen expuesto',
  'Vestido de brillos escote asimetrico',
  'Vestido corto con cuatro aberturas en el frente',
  'Vestido largo falda acampanada y escote en V',
  'Vestido corte sirena con transparencias en el escote',
  'Vestido largo con detalles en el top falda sirena',
  'Vestido largo mangas tipo capa',
  'Vestido largo Victoria Vidarte escote cerrado al cuello con lazo',
  'Vestido de terciopelo con perlas y espalda descubierta',
  'Vestido corto con corset Victoria Vidarte',
  'Vestido largo tipo corset brilloso',
  'Vestido corto de terciopelo escote en V',
  'Vestido corto falso corset fruncido en la falda',
  'Vestido largo verde agua de un hombro con lentejuelas',
  'Vestido largo escote drapeado, espalda ajustable Victoria Vidarte',
  'Vestido largo escote con transparencias',
  'Vestido largo corte sirena hombros descubiertos',
  'Vestido corto strapless',
  'Vestido tela negra con lentejuelas verdes y azules',
  'Vestido largo de terciopelo con perlas en la espalda',
  'Vestido largo con mangas tipo capa',
  'Vestido escote v falda corte princesa',
  'Vestido escote V tipo saten',
  'Vestido largo con lentejuelas y aberturas en las costillas',
  'Vestido lardo falda asimetrica',
  'Vestido largo tela con brillos escote en V',
  'Vestido largo escote en V Victoria Vidarte',
  'Vestido largo tela metalica azul',
  'Vestido corto tela terciopelo escote drapeado',
  'Vestido corto corset, tela en encaje y falda fruncida',
  'Vestido lardo de un hombro con detalles en strass',
  'Vestido corto de lentejuelas con mangas largas.',
  'Vestido corto falso corset.',
  'Vestido largo con brillos y tajo en la pierna',
  'Vestido corto strapless con flor de mostacillas',
  'Vestido con lentejuelas cruzado en la espalda',
  'Vestido tipo sirena con brillos en el busto',
  'Vestido con lentejuelas colgantes',
  'Vestido irregular, una manga, cavado en abdomen, tela metalizada',
  'Vestido largo, lentejuelas cobrizas, tajo',
  'Vestido largo tipo corset con tajo en la pierna Victoria Vidarte',
  'Vestido largo drapeado en el escote y la',
  'Vestido corto fruncido con brillos',
  'Vestido corto espalda descubierta',
  'Vestido asimetrico con aro en hombro y cadera',
  'Vestido corto mangas largas y falda plisada',
  'Vestido corto strapless con brillos',
  'Vestido corto straples con lazo',
  'Vestido largo lentejuelas escote asimetrico',
  'Vestido largo escote en V con cuatro aberturas al frente',
  'Vestido plata tela metalica con detalles al frente',
  'Vestido corto mangas murcielago',
  'Vestido corto adelante, largo atras con detalles dorados',
  'Vestido corto con brillos , hombros caidos',
  'Vestido corto escote en V con cinta para atar el cuello',
  'Mono corto con mostacillas en los hombros',
  'Mono corto con escote cuadrado',
  'Vestido corto con lentejuelas y mostacillas',
  'Vestido corto con mangas abullonadas de tul',
  'Vestido corto con perlas en el cuello y mangas murcielago',
  'Vestido con falda de tul y cuello con brillos',
  'Vestido corto falso corset con falda drapeda',
  'Vestido largo falso corset con tajo en la pierna',
  'Vestido largo con corset y transparencias',
  'Vestido largo con brillos, pedreria y falda corte princesa',
  'Vestido largo escote en V con lentejuelas doradas',
  'Vestido largo corte sirena con cola',
  'Vestido corto falda con flores blancas',
  'Vestido de saten con corte en la pierna',
  'Vestido largo corte sirena espalda con transparencias y pedreria',
  'Vestido corto con corset en encaje y falda fruncida',
  'Vestido largo falda de tul con brillos',
  'Vestido largo con lazo en el cuello Victoria Vidarte',
  'Vestido largo con corset nude y transparencias',
  'Vestido largo tela con brillos mangas largas de tul',
  'Vestido largo escote cruzado',
  'Vestido corto una manga, terciopelo negro con brillos, marca Mango',
  'Vestido fruncido en el costado y abertura en abdomen',
  'Vestido tela engomada con aberturas y detalle en strass adelante',
  'Vestido con detalle azul en el bustier',
  'Vestido de un hombro con fruncido y transparencias',
  'Vestido largo con transparencias en abdomen y bajo de falda',
  'Vestido con lentejuelas abierto en frente y espalda',
  'Mono talle M, con aberturas y top de lentejuelas',
  'Mono strapless con volados',
  'Mono de un hombro pantalon acampanado',
  'Vestido con detalles de strass escote en V',
  'Vestido con corset falda sirena',
  'Vestido con corset y falda drapeada',
  'Mono con bolado al frente pantalon acampanado',
  'Mono con hombros caidos',
  'Vestido blanco cuello halter',
  'Vestido corto fruncido con mangas largas',
  'Vestido corto falda princesa con lentejuelas tornasol',
  'Vestido con mangas tipo capa',
  'Vestido con brillos cruzado atras',
  'Vestido falso corset amarillo',
  'Vestido con corset y falda corte princesa',
  'Vestido largo con lentejuelas colgantes',
  'Vestido corto tela con brillos falda fruncida atras',
  'Vestido naranja drapeado con cintas para atar',
  'Vestido largo, tajo y tiras en las espalda',
  'Vestido largo tajo y cintas para atar escote drapeado',
  'Vestido corto dorado metalizado, irregular, un hombro',
  'Vestido dorado, escote abuchado, drapeado de lado',
  'Vestido de tela con glitter con cIntas para atar',
  'Vestido con brillos y aberturas en abdomen y espalda',
  'Vestido dorado tela metalica con transparencias',
  'Vestido beige pollera pantalón',
  'Vestido corto perlado, tiras anchas en espalda, tela brillante',
  'Vestido largo beige, corset y tajo, tiras en espalda',
  'Vestido largo, beige, espalda abierta, escote abuchado, tajo',
  'Veatido corto falda princesa con lentejuelas tornasol',
  'Vestido largo con breteles torneados de tela brillosa',
  'Vestido engomado con cuatro aberturas en el frente',
  'Vestido corto detalle cruzado en escote',
  'Vestido largo con aberturas y detalle en stras',
  'Vestidp rojo metalizado con frunce en escote',
  'Vestido largo tela de lineas con cintas para atar',
  'Vestido largo con aberturas y lentejuelas en busto',
  'Vestido largo falso corset',
  'Vetido corto cetalle cruzado en escote',
  'Vestido con corset y falda con gliter',
  'Vestido largo corte princesa Victoria Vidarte',
  'Vestido largo, falso corset, escote drapeado y tajo profundo',
  'Vestido largo con hombros y espalda descubiertos aplique en el cuello',
  'Vestido largo falda drapeada',
  'Vestido largo e terciopelo con los hombros decubiertos',
  'Vestido largo drapeado en la espalda y el escote Victoria Vidarte',
  'Vestido largo de tela negra con lentejuelas verdes y azules',
  'Vestido largo espalda descubierta con lazo Victoria Vidarte',
  'Vestido corto escote V falda acampanada',
  'Vestido largo escote V tela tipo saten',
  'Vestido largo escote halter tela tipo saten',
  'Vestido largo escote V con lentejuelas',
  'Vestido celeste corto strapless',
  'Vestido largo falda asimetrica',
  'Vestido largo falda corte princesa azul oscuro',
  'Vestido largo con lentejuelas en la parte superior',
  'Vestido largo ecote cruzado en V',
  'Vestido azul metalico con aberturas en el frente',
  'Vestido largo con abertura en abdomen y lentejuelas en el busto',
  'Vestido aterciopelado con escote drapeado',
  'Vestido escote en V con falda acampanada',
  'Vestido larga falda de gasa con detalles arriba',
  'Vestido largo, escote en V mangas con volados',
  'Vestido largo drapeado en el escote y la espalda Victoria Vidarte',
  'Vestido largo plateado, con faja y escote, tela plisada',
  'Vestido largo tela metalica con transparencias',
  'Vestido corto con lentejuelas y escote con transparencias',
  'Vestido largo con lentejuelas en dorado',
  'Vestido corto falda con lentejuelas',
  'Vestido rojo falda de gasa roja',
  'Vestido largo tela plisada',
  'Mono largo tela plisada',
  'Vestido fruncido y con abertura en el costado',
  'Vestido fruncido con transparencias en hombros abdomen y falda',
  'Vestido engomado con aberturas y detalle en strass',
  'Vestido largo con detalles de strass escote en V',
  'Mono blanco straples con volado',
  'Mono clanco de un hombro patalon acampanado',
  'Vestido fruncido con mangas largas',
  'Vestido dorado, cubierto de lentejuelas doradas cuadradas',
  'Vestido largo tela con gitter para atar',
  'Vestido tela metalica con transparencias',
  'Vestido largo con brillos mangas murcielago',
  'Vestido escote V falda acampanada',
  'Vestido tela con brillos detalles en el bustier',
  'Vestido de un hombro con volados',
  'Vestido largo con corset y falda drapeada',
  'Vestido larga falda de tul con lentejuelas arriba',
  'Vestido de novia con detalles en la parte superior',
  'Vestido corto fruncido mangas largas',
  'Vestido largo estampado floreado y mangas con flores',
  'Vestido largo verde agua de un hombro con volados',
  'Vestido escote V brillos mangas murcielago',
  'Vestido celeste largo falso corset con escote y falda drapeado',
  'Vestido largo escote en V',
  'Vestido largo falda con volados',
  'Vestido largo falda en gasa y escote con detalles',
  'Vestido largo falda plisada con capa',
  'Vestido largo de un hombro',
  'Vestido con detalles dorados y falda de tul',
  'Vestido con detalles en la parte superior y falda de gasa',
  'Vestido largo falda princesa con volados',
  'Vestido largo falda princesa manga con volados',
  'Vestido largo falda corte princesa con detalles al frente',
  'Vestido largo falda corte princesa con volados',
  'Vestido largo escote en V falda corte princesa',
  'Vestido largo con cintas para atar',
  'Vestido escote V',
  'Vestido largo tela plisada de mangas largas',
  'Vestido largo tela plisada mangas largas.'
);
