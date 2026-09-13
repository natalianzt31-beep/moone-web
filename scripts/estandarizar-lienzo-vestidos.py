#!/usr/bin/env python3
"""Estandariza las fotos de vestidos (y prendas de cuerpo entero similares)
a UN MISMO lienzo fijo, con la modela siempre al mismo tamaño relativo entre
foto y foto, y el resto del cuadro relleno EXTENDIENDO los píxeles reales
del borde de esa misma foto (no un color plano) — así no se nota un "corte"
entre la foto y el resto del rectángulo, ni siquiera si el fondo de estudio
tiene un degradé sutil (común en fotos con luz de estudio tipo softbox):
un relleno de color plano, por más que sea el color "correcto" en promedio,
igual se nota como una costura donde el degradé real de la foto se corta en
seco. Extendiendo el píxel del borde hacia afuera, la transición es
continua.

Por que existe lo demás: normalizar solo el "% de la foto que ocupa la
modela" (lo que hacía normalizar-foto-producto.py) no alcanza para que dos
fotos se vean del mismo tamaño una al lado de la otra en la grilla del
catálogo, porque cada foto termina con sus PROPIAS dimensiones finales
según el recorte de esa foto puntual. Acá en cambio:

  1. Se detecta el alto real (en píxeles) de la modela+prenda en la foto
     ORIGINAL.
  2. Se escala TODA la foto (sin recortar) para que ese alto quede igual
     en TODAS las fotos procesadas (CONTENT_HEIGHT píxeles).
  3. Se la pega centrada sobre un lienzo de tamaño FIJO (CANVAS_WIDTH x
     CANVAS_HEIGHT, igual para cada foto del catálogo), extendiendo el
     borde de la foto hacia afuera para rellenar lo que falta.

Como el alto de la modela queda idéntico en píxeles en todas las fotos, y
el lienzo final también es idéntico, todas las fotos del catálogo se ven
literalmente del mismo tamaño y con la modela a la misma "distancia de
cámara" — el ancho que ocupa cada una varía solo según el vuelo real de
cada prenda (una pollera amplia ocupa más ancho que un vestido tipo
sirena), nunca por un error de procesamiento.

Salvaguarda: si el ancho de una foto ya escalada no entra en el lienzo, se
recorta el ancho sobrante (nunca el alto) y nunca más de un 22% del ancho
del contenido real (MAX_SHRINK) — el mismo límite que usa
normalizar-foto-producto.py. Si una foto necesitaría más que eso, NO se
toca y se avisa por consola para revisarla a mano.

Uso:
    python3 scripts/estandarizar-lienzo-vestidos.py public/images/vestidos/*.jpg
    python3 scripts/estandarizar-lienzo-vestidos.py --dry-run public/images/vestidos/*.jpg
"""

from __future__ import annotations

import sys

import numpy as np
from PIL import Image

CONTENT_HEIGHT = 1050  # alto (px) al que se escala la modela+prenda en TODAS las fotos
CANVAS_WIDTH = 800
CANVAS_HEIGHT = 1250
MAX_SHRINK = 0.22  # nunca recortar más de este % del ancho real del contenido
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
    if content_h <= 0:
        print(f"  {path}: bbox inválido, se deja sin cambios")
        return

    scale = CONTENT_HEIGHT / content_h
    w, h = original.size
    new_w, new_h = round(w * scale), round(h * scale)
    scaled_x0, scaled_x1 = x0 * scale, x1 * scale
    content_w = scaled_x1 - scaled_x0

    # Cuánto hay que recortar del ancho de la imagen YA escalada para que
    # entre en el lienzo. Primero se come el margen (siempre seguro);
    # si el contenido mismo no entra, se limita a MAX_SHRINK de su ancho.
    max_total_width = CANVAS_WIDTH
    overflow = new_w - max_total_width
    content_overflow = content_w - max_total_width
    if content_overflow > content_w * MAX_SHRINK:
        permitido = round(content_w * MAX_SHRINK)
        print(
            f"  ATENCION {path}: el contenido escalado ({content_w:.0f}px) no entra en el "
            f"lienzo ({CANVAS_WIDTH}px) ni recortando el {MAX_SHRINK*100:.0f}% máximo seguro "
            f"(recorte necesario {content_overflow/content_w*100:.1f}%). No se tocó, revisar a mano."
        )
        return

    # El alto de contenido queda SIEMPRE en exactamente CONTENT_HEIGHT tras
    # escalar (por construcción), y CONTENT_HEIGHT < CANVAS_HEIGHT con margen
    # de sobra — así que si el alto de la imagen escalada no entra en el
    # lienzo, lo que sobra es siempre margen (por arriba/abajo de la
    # modela), nunca la modela misma. Igual se recorta ese margen sin tocar
    # jamás el rango [scaled_y0, scaled_y1] donde está el contenido real.
    scaled_y0, scaled_y1 = y0 * scale, y1 * scale

    if dry_run:
        pct = max(0, overflow) / new_w * 100 if new_w else 0
        print(f"  {path}: escala={scale:.2f} nuevo_tamaño={new_w}x{new_h} recorte_ancho={pct:.1f}%")
        return

    resized = original.resize((new_w, new_h), Image.LANCZOS)

    if overflow > 0:
        # Recorta el ancho sobrante centrado en el contenido (nunca el alto).
        center = (scaled_x0 + scaled_x1) / 2
        left = round(center - CANVAS_WIDTH / 2)
        left = max(0, min(left, new_w - CANVAS_WIDTH))
        resized = resized.crop((left, 0, left + CANVAS_WIDTH, new_h))
        scaled_x0, scaled_x1 = scaled_x0 - left, scaled_x1 - left
        new_w = CANVAS_WIDTH

    if new_h > CANVAS_HEIGHT:
        # Recorta el alto sobrante (siempre margen, ver comentario arriba),
        # dejando el rango de contenido [scaled_y0, scaled_y1] siempre
        # dentro de la ventana recortada.
        center_y = (scaled_y0 + scaled_y1) / 2
        top = round(center_y - CANVAS_HEIGHT / 2)
        lowest_allowed = max(0, round(scaled_y1) - CANVAS_HEIGHT)
        highest_allowed = min(new_h - CANVAS_HEIGHT, round(scaled_y0))
        top = max(lowest_allowed, min(top, highest_allowed))
        resized = resized.crop((0, top, new_w, top + CANVAS_HEIGHT))
        new_h = CANVAS_HEIGHT

    # Relleno = extender el propio borde de la foto hacia afuera (no un
    # color plano): así la transición entre la foto y el resto del
    # rectángulo es continua, sin costura visible.
    paste_x = round(CANVAS_WIDTH / 2 - new_w / 2)
    paste_y = round(CANVAS_HEIGHT / 2 - new_h / 2)
    pad_left, pad_right = paste_x, CANVAS_WIDTH - new_w - paste_x
    pad_top, pad_bottom = paste_y, CANVAS_HEIGHT - new_h - paste_y
    arr = np.array(resized)
    padded = np.pad(arr, ((pad_top, pad_bottom), (pad_left, pad_right), (0, 0)), mode="edge")
    canvas = Image.fromarray(padded)
    canvas.save(path, quality=92)
    print(f"  {path}: escala={scale:.2f} -> lienzo {CANVAS_WIDTH}x{CANVAS_HEIGHT}")


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
