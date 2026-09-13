#!/usr/bin/env python3
"""Normaliza el encuadre de fotos de producto (venta o alquiler) para que la
modelo ocupe siempre una proporcion similar del cuadro, sin importar la
resolucion o el recorte original de cada foto.

Por que existe: las fotos llegan de fuentes distintas (fotos sueltas,
collages frente/espalda de un mismo shooting, lienzos casi cuadrados con
mucho margen a los costados) con distinta cantidad de margen blanco
alrededor de la modelo. Eso hace que en la galeria del sitio algunas
prendas se vean "mas cerca de cámara" que otras, o más chicas dentro del
recuadro. Este script recorta (o si hace falta, agrega un margen blanco)
tanto en alto como en ancho para que la modelo siempre ocupe una fracción
similar del cuadro — nunca recorta la prenda ni a la persona, solo el
fondo blanco sobrante.

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

TARGET_FILL_H = 0.90  # fracción de la altura del cuadro que debe ocupar la modelo
TARGET_FILL_W = 0.85  # fracción del ancho del cuadro que debe ocupar la modelo
MIN_FILL_H = 0.87  # por debajo de esto, se corrige el alto
MIN_FILL_W = 0.75  # por debajo de esto, se corrige el ancho (más margen de sobra: la pose varía más el ancho que el alto)
MAX_SHRINK = 0.22  # nunca recortar de una sola vez más de este % del alto/ancho actual: si la detección de
# contenido falla (pelo suelto, piernas o zapatos muy claros contra el fondo), un recorte
# "de más" corta cabeza/pies en vez de solo margen blanco — este techo limita el daño posible
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


def fit_to_size(img: Image.Image, axis: str, final_size: int) -> Image.Image:
    """Ajusta la imagen a un ancho o alto exacto (según `axis`, 'h' o 'w'):
    recorta margen blanco si sobra, o agrega margen blanco si hace falta,
    centrado sobre el contenido detectado. Nunca recorta el contenido."""
    w, h = img.size
    current = h if axis == "h" else w
    if current == final_size:
        return img
    gray = np.array(img.convert("L"))
    bbox = content_bbox(gray)
    if current > final_size:
        if bbox is None:
            return img
        # mismo salvavidas que en _normalizar_eje: nunca recortar de una sola
        # vez más de MAX_SHRINK, así una detección de contenido equivocada no
        # puede terminar cortando cabeza o pies al alinear el par.
        final_size = max(final_size, round(current * (1 - MAX_SHRINK)))
        if final_size >= current:
            return img
        x0, x1, y0, y1 = bbox
        lo, hi = (y0, y1) if axis == "h" else (x0, x1)
        content = hi - lo
        extra = max(final_size - content, 0)
        start = max(0, lo - extra // 2)
        end = min(current, start + final_size)
        start = end - final_size
        box = (0, start, w, end) if axis == "h" else (start, 0, end, h)
        return img.crop(box)
    pad_total = final_size - current
    pad_a = pad_total // 2
    pad_b = pad_total - pad_a
    size = (w, final_size) if axis == "h" else (final_size, h)
    offset = (0, pad_a) if axis == "h" else (pad_a, 0)
    lienzo = Image.new("RGB", size, (255, 255, 255))
    lienzo.paste(img, offset)
    return lienzo


def _normalizar_eje(img: Image.Image, path: str, axis: str, target: float, min_fill: float) -> Image.Image:
    label = "alto" if axis == "h" else "ancho"
    gray = np.array(img.convert("L"))
    h, w = gray.shape
    current = h if axis == "h" else w
    bbox = content_bbox(gray)
    if bbox is None:
        print(f"  {path}: no se detectó contenido, se deja sin cambios")
        return img
    x0, x1, y0, y1 = bbox
    lo, hi = (y0, y1) if axis == "h" else (x0, x1)
    content = hi - lo
    fill = content / current

    # Salvavidas: en una foto de cuerpo entero la persona siempre es más alta
    # que ancha. Si la detección de contenido da un recuadro más ancho que
    # alto, es señal de que falló (típicamente piernas o zapatos claros que
    # se confunden con el fondo) y NO hay que recortar el alto a ciegas —
    # se preferiría cortar pies/cabeza antes que dejar la foto intacta.
    if axis == "h" and (y1 - y0) <= (x1 - x0):
        print(
            f"  {path}: detección de encuadre poco confiable (recuadro más ancho que alto) — revisar a mano, no se toca el alto"
        )
        return img

    if fill >= min_fill:
        print(f"  {path}: {label} ya OK ({fill:.2f}), sin cambios")
        return img
    desired = min(round(content / target), current)
    margin_to_remove = current - desired
    margin_to_remove = min(margin_to_remove, round(current * MAX_SHRINK))
    margin_lo, margin_hi = lo, current - hi
    total_margin = margin_lo + margin_hi
    if total_margin <= 0:
        return img
    remove_lo = round(margin_to_remove * (margin_lo / total_margin))
    remove_hi = margin_to_remove - remove_lo
    box = (0, remove_lo, w, h - remove_hi) if axis == "h" else (remove_lo, 0, w - remove_hi, h)
    cropped = img.crop(box)
    new_current = cropped.size[1] if axis == "h" else cropped.size[0]
    print(f"  {path}: {label} {current}px -> {new_current}px (encuadre {fill:.2f} -> ~{target:.2f})")
    return cropped


def normalizar_una(path: str) -> None:
    original = Image.open(path).convert("RGB")
    img = _normalizar_eje(original, path, "h", TARGET_FILL_H, MIN_FILL_H)
    img = _normalizar_eje(img, path, "w", TARGET_FILL_W, MIN_FILL_W)
    if img.size != original.size:
        img.save(path, quality=92)


def _content_h_confiable(img: Image.Image, bbox: tuple[int, int, int, int] | None) -> int | None:
    """Alto de contenido, o None si la detección no es confiable (recuadro
    más ancho que alto — ver el mismo salvavidas en _normalizar_eje)."""
    if bbox is None:
        return None
    x0, x1, y0, y1 = bbox
    if (y1 - y0) <= (x1 - x0):
        return None
    return y1 - y0


def normalizar_par(front: str, back: str) -> None:
    normalizar_una(front)
    normalizar_una(back)

    fimg, bimg = Image.open(front), Image.open(back)
    if fimg.size == bimg.size:
        return

    bbox_f = content_bbox(np.array(fimg.convert("L")))
    bbox_b = content_bbox(np.array(bimg.convert("L")))

    content_hf = _content_h_confiable(fimg, bbox_f)
    content_hb = _content_h_confiable(bimg, bbox_b)
    if content_hf is None or content_hb is None:
        print(
            f"  {front} / {back}: detección de alto poco confiable en al menos una foto — no se ajusta el alto, revisar a mano"
        )
    else:
        final_h = round(max(content_hf, content_hb) / TARGET_FILL_H)
        fimg = fit_to_size(fimg, "h", final_h)
        bimg = fit_to_size(bimg, "h", final_h)

    if bbox_f is not None and bbox_b is not None:
        content_wf, content_wb = bbox_f[1] - bbox_f[0], bbox_b[1] - bbox_b[0]
        final_w = round(max(content_wf, content_wb) / TARGET_FILL_W)
        fimg = fit_to_size(fimg, "w", final_w)
        bimg = fit_to_size(bimg, "w", final_w)

    if fimg.size != Image.open(front).size or bimg.size != Image.open(back).size:
        fimg.save(front, quality=92)
        bimg.save(back, quality=92)
        print(f"  {front} / {back}: alineadas a las mismas dimensiones ({fimg.size[0]}x{fimg.size[1]}px)")


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
