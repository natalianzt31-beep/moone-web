#!/usr/bin/env python3
"""Estandariza las fotos de vestidos (y prendas de cuerpo entero similares)
a UN MISMO lienzo fijo, con la modela al mismo tamaño relativo entre foto y
foto siempre que el vuelo de la prenda lo permita, y el resto del cuadro
relleno con BLANCO PURO (#ffffff) — el mismo blanco de fondo que usan las
tarjetas del catálogo (bg-blanco), para que el margen del lienzo se funda
con la tarjeta.

Por que existe lo demás: normalizar solo el "% de la foto que ocupa la
modela" (lo que hacía normalizar-foto-producto.py) no alcanza para que dos
fotos se vean del mismo tamaño una al lado de la otra en la grilla del
catálogo, porque cada foto termina con sus PROPIAS dimensiones finales
según el recorte de esa foto puntual. Acá en cambio:

  1. Se detecta el ancho y el alto real (en píxeles) de la modela+prenda en
     la foto original.
  2. Se escala TODA la foto (sin recortar) para que ese alto quede igual en
     TODAS las fotos procesadas (CONTENT_HEIGHT píxeles) — MIENTRAS el
     ancho resultante entre en el lienzo con un margen mínimo. Medido sobre
     el catálogo real: el 96% de las fotos (162 de 168) tiene un vuelo de
     prenda de 214 a 494px a esa altura estándar, muy por debajo del ancho
     de lienzo necesario para las pocas polleras muy amplias — con un
     lienzo pensado para estas últimas, la enorme mayoría quedaba como una
     "banda angosta" perdida en un rectángulo blanco gigante.
  3. Si el vuelo de la prenda a esa altura estándar NO entra en el lienzo
     (polleras/faldas muy amplias, tipo vestido de fiesta con vuelo
     completo), se prioriza mostrar la prenda COMPLETA en vez de recortarle
     el vuelo: se reduce la escala lo necesario para que entre entera. Esa
     foto puntual queda con la modela un poco más chica que el resto —
     mejor eso que cortarle el vuelo a la falda o, peor, agrandar el lienzo
     para todo el catálogo y volver a la banda angosta en el 96% restante.
  4. Se pega centrada sobre un lienzo de tamaño FIJO (CANVAS_WIDTH x
     CANVAS_HEIGHT, igual para cada foto del catálogo), rellenando con
     blanco puro lo que falta alrededor.

Salvaguarda de recorte (solo entra en juego si aun así sobra un poco de
ancho, p. ej. por fondo/sombra fuera del contenido detectado): se recorta
el ancho sobrante centrado en la prenda, nunca el alto, y nunca lo
suficiente como para tocar el rango de contenido detectado — ver
`SIDE_MARGIN`.

Uso:
    python3 scripts/estandarizar-lienzo-vestidos.py public/images/vestidos/*.jpg
    python3 scripts/estandarizar-lienzo-vestidos.py --dry-run public/images/vestidos/*.jpg
"""

from __future__ import annotations

import sys

import numpy as np
from PIL import Image

CONTENT_HEIGHT = 1050  # alto (px) al que se escala la modela+prenda cuando el vuelo entra
CANVAS_WIDTH = 700
CANVAS_HEIGHT = 1250
SIDE_MARGIN = 30  # margen mínimo a cada lado de la prenda dentro del lienzo
DELTA = 18
MIN_FRAC = 0.12
PAD_CHECK = 6


def content_bbox(gray: np.ndarray) -> tuple[int, int, int, int] | None:
    h, w = gray.shape
    bg = gray[:PAD_CHECK, :PAD_CHECK].mean()
    diff = np.abs(gray.astype(np.int16) - bg)
    mask = diff > DELTA
    rows = np.where(mask.sum(axis=1) > w * MIN_FRAC)[0]
    cols = np.where(mask.sum(axis=0) > h * MIN_FRAC)[0]
    if len(rows) == 0 or len(cols) == 0:
        return None
    return cols.min(), cols.max(), rows.min(), rows.max()


def procesar(path: str, dry_run: bool = False) -> None:
    original = Image.open(path).convert("RGB")
    gray = np.array(original.convert("L"))
    bbox = content_bbox(gray)
    if bbox is None:
        print(f"  {path}: no se detectó contenido, se deja sin cambios")
        return

    x0, x1, y0, y1 = bbox
    content_h = y1 - y0
    content_w0 = x1 - x0
    if content_h <= 0 or content_w0 <= 0:
        print(f"  {path}: bbox inválido, se deja sin cambios")
        return

    max_content_w = CANVAS_WIDTH - 2 * SIDE_MARGIN
    scale = CONTENT_HEIGHT / content_h
    achicada = False
    if content_w0 * scale > max_content_w:
        # El vuelo de la prenda a la altura estándar no entra en el lienzo:
        # se prioriza mostrarla completa en vez de recortarle el vuelo.
        scale = max_content_w / content_w0
        achicada = True

    w, h = original.size
    new_w, new_h = round(w * scale), round(h * scale)
    scaled_x0, scaled_x1 = x0 * scale, x1 * scale
    scaled_y0, scaled_y1 = y0 * scale, y1 * scale
    overflow = new_w - CANVAS_WIDTH

    if dry_run:
        pct = max(0, overflow) / new_w * 100 if new_w else 0
        nota = " (modela achicada para no recortar el vuelo)" if achicada else ""
        print(
            f"  {path}: escala={scale:.2f} nuevo_tamaño={new_w}x{new_h} "
            f"recorte_ancho={pct:.1f}%{nota}"
        )
        return

    resized = original.resize((new_w, new_h), Image.LANCZOS)

    if overflow > 0:
        # Recorta el margen sobrante centrado en la prenda (nunca el alto,
        # nunca lo suficiente como para tocar el contenido: por construcción
        # el contenido ya entra con SIDE_MARGIN de sobra a cada lado).
        center = (scaled_x0 + scaled_x1) / 2
        left = round(center - CANVAS_WIDTH / 2)
        left = max(0, min(left, new_w - CANVAS_WIDTH))
        resized = resized.crop((left, 0, left + CANVAS_WIDTH, new_h))
        scaled_x0, scaled_x1 = scaled_x0 - left, scaled_x1 - left
        new_w = CANVAS_WIDTH

    if new_h > CANVAS_HEIGHT:
        # Recorta el alto sobrante (siempre margen por arriba/abajo de la
        # modela, nunca la modela misma: CONTENT_HEIGHT/la escala reducida
        # siempre deja margen vertical de sobra dentro de CANVAS_HEIGHT).
        center_y = (scaled_y0 + scaled_y1) / 2
        top = round(center_y - CANVAS_HEIGHT / 2)
        lowest_allowed = max(0, round(scaled_y1) - CANVAS_HEIGHT)
        highest_allowed = min(new_h - CANVAS_HEIGHT, round(scaled_y0))
        top = max(lowest_allowed, min(top, highest_allowed))
        resized = resized.crop((0, top, new_w, top + CANVAS_HEIGHT))
        new_h = CANVAS_HEIGHT

    # Relleno = blanco puro (#ffffff), igual al fondo de la tarjeta del
    # catálogo, para que el margen del lienzo no se note como un rectángulo
    # aparte de la tarjeta.
    paste_x = round(CANVAS_WIDTH / 2 - new_w / 2)
    paste_y = round(CANVAS_HEIGHT / 2 - new_h / 2)
    canvas = Image.new("RGB", (CANVAS_WIDTH, CANVAS_HEIGHT), (255, 255, 255))
    canvas.paste(resized, (paste_x, paste_y))
    canvas.save(path, quality=92)
    nota = " (modela achicada para no recortar el vuelo)" if achicada else ""
    print(f"  {path}: escala={scale:.2f} -> lienzo {CANVAS_WIDTH}x{CANVAS_HEIGHT}{nota}")


def main(argv: list[str]) -> None:
    dry_run = "--dry-run" in argv
    paths = [a for a in argv if a != "--dry-run"]
    if not paths:
        print(__doc__)
        return
    for path in paths:
        procesar(path, dry_run=dry_run)


if __name__ == "__main__":
    main(sys.argv[1:])
