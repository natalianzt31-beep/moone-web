#!/usr/bin/env python3
"""Normaliza el encuadre de fotos de producto (venta o alquiler) para que la
modelo ocupe siempre una proporcion similar del cuadro, sin importar la
resolucion o el recorte original de cada foto.

Por que existe: las fotos llegan de fuentes distintas (fotos sueltas,
collages frente/espalda de un mismo shooting) con distinta cantidad de
margen blanco arriba/abajo de la modelo. Eso hace que en la galeria del
sitio algunas prendas se vean "mas cerca de cámara" que otras. Este script
recorta (o si hace falta, agrega un margen blanco) para que la modelo
siempre ocupe ~90% de la altura del cuadro — nunca recorta la prenda ni a
la persona, solo el fondo blanco sobrante.

Uso:
    python3 scripts/normalizar-foto-producto.py foto.jpg
    python3 scripts/normalizar-foto-producto.py frente.jpg espalda.jpg
    python3 scripts/normalizar-foto-producto.py public/images/vestidos/*.jpg

Si se pasan dos fotos de la misma prenda (frente y espalda), ademas de
normalizar cada una las deja con el mismo ancho y alto entre si, para que
no "salte" el tamaño al pasar de una foto a otra en el carrusel del sitio.

Requiere Pillow y NumPy (ya deberían estar disponibles en el entorno usado
para procesar estas fotos).
"""

from __future__ import annotations

import sys

import numpy as np
from PIL import Image

TARGET_FILL = 0.90  # fracción de la altura del cuadro que debe ocupar la modelo
DELTA = 18  # cuánto debe diferir un pixel del fondo para contar como "contenido"
MIN_FRAC = 0.12  # fracción mínima de la fila/columna que debe ser "contenido"
PAD_CHECK = 6  # tamaño del parche de esquina usado para medir el color de fondo


def content_bbox(gray: np.ndarray) -> tuple[int, int, int, int] | None:
    """Caja delimitadora (x0, x1, y0, y1) del contenido (modelo + prenda),
    detectado como lo que difiere claramente del color de fondo de la
    esquina superior izquierda. Devuelve None si no se detecta nada."""
    h, w = gray.shape
    bg = gray[:PAD_CHECK, :PAD_CHECK].mean()
    diff = np.abs(gray.astype(np.int16) - bg)
    mask = diff > DELTA
    rows = np.where(mask.sum(axis=1) > w * MIN_FRAC)[0]
    cols = np.where(mask.sum(axis=0) > h * MIN_FRAC)[0]
    if len(rows) == 0 or len(cols) == 0:
        return None
    return cols.min(), cols.max(), rows.min(), rows.max()


def fit_to_height(img: Image.Image, final_h: int) -> Image.Image:
    """Ajusta la imagen a una altura exacta: recorta margen blanco si sobra,
    o agrega margen blanco arriba/abajo si hace falta. Nunca recorta el
    contenido detectado."""
    w, h = img.size
    if h == final_h:
        return img
    if h > final_h:
        gray = np.array(img.convert("L"))
        bbox = content_bbox(gray)
        if bbox is None:
            return img
        _, _, y0, y1 = bbox
        content_h = y1 - y0
        extra = max(final_h - content_h, 0)
        top = max(0, y0 - extra // 2)
        bottom = min(h, top + final_h)
        top = bottom - final_h
        return img.crop((0, top, w, bottom))
    pad_total = final_h - h
    pad_top = pad_total // 2
    pad_bottom = pad_total - pad_top
    lienzo = Image.new("RGB", (w, final_h), (255, 255, 255))
    lienzo.paste(img, (0, pad_top))
    return lienzo


def normalizar_una(path: str) -> None:
    img = Image.open(path).convert("RGB")
    gray = np.array(img.convert("L"))
    h, w = gray.shape
    bbox = content_bbox(gray)
    if bbox is None:
        print(f"  {path}: no se detectó contenido, se deja sin cambios")
        return
    _, _, y0, y1 = bbox
    content_h = y1 - y0
    fill = content_h / h
    if fill >= 0.87:
        print(f"  {path}: encuadre ya OK ({fill:.2f}), sin cambios")
        return
    desired_h = min(round(content_h / TARGET_FILL), h)
    margin_to_remove = h - desired_h
    top_margin, bottom_margin = y0, h - y1
    total_margin = top_margin + bottom_margin
    if total_margin <= 0:
        return
    remove_top = round(margin_to_remove * (top_margin / total_margin))
    remove_bottom = margin_to_remove - remove_top
    cropped = img.crop((0, remove_top, w, h - remove_bottom))
    cropped.save(path, quality=92)
    print(f"  {path}: {h}px -> {cropped.size[1]}px (encuadre {fill:.2f} -> ~{TARGET_FILL:.2f})")


def normalizar_par(front: str, back: str) -> None:
    normalizar_una(front)
    normalizar_una(back)

    fimg, bimg = Image.open(front), Image.open(back)
    if fimg.size == bimg.size:
        return

    bbox_f = content_bbox(np.array(fimg.convert("L")))
    bbox_b = content_bbox(np.array(bimg.convert("L")))
    if bbox_f is None or bbox_b is None:
        return
    content_hf = bbox_f[3] - bbox_f[2]
    content_hb = bbox_b[3] - bbox_b[2]
    final_h = round(max(content_hf, content_hb) / TARGET_FILL)

    fimg2 = fit_to_height(fimg, final_h)
    bimg2 = fit_to_height(bimg, final_h)
    fimg2.save(front, quality=92)
    bimg2.save(back, quality=92)
    print(f"  {front} / {back}: alineadas a la misma altura ({final_h}px)")


def main(argv: list[str]) -> None:
    if not argv:
        print(__doc__)
        return
    if len(argv) == 2:
        normalizar_par(argv[0], argv[1])
    else:
        for path in argv:
            normalizar_una(path)


if __name__ == "__main__":
    main(sys.argv[1:])
