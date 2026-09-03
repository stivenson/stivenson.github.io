#!/usr/bin/env python3
"""
Mide cuánto se puede acertar en ACRIMA SIN mirar la anatomía.

Reproduce las cifras del artículo "De la retina al tensor". Cada atajo es un
clasificador de un solo umbral sobre una única variable:

  - el ancho de la imagen en píxeles
  - el peso del archivo en disco
  - el color medio, como diferencia entre el canal rojo y el azul

Se informan dos cifras por atajo:

  in-sample : el umbral se busca sobre las mismas imágenes que se evalúan.
              Es una cota superior optimista, útil solo para acotar.
  held-out  : el umbral se ajusta en el 70 % y se evalúa en el 30 % restante,
              estratificado, promediando 200 particiones. Esta es la honesta.

Uso:
    python medir_atajos.py <carpeta_con_imagenes>

La carpeta puede ser ACRIMA completa (705 imágenes) o el subconjunto
acrima_mini (60). La etiqueta se deduce del nombre: "_g_" = glaucoma.

Requiere: numpy, pillow.
"""

import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SEMILLA = 42
N_PARTICIONES = 200
FRAC_ENTRENAMIENTO = 0.70


def cargar(carpeta):
    """
    Recorre la carpeta y mide las tres variables de atajo por imagen.

    Parámetros de entrada:
    carpeta = ruta a las imágenes de ACRIMA

    Parámetros de salida:
    X = matriz (n, 3) con ancho, bytes en disco y color medio (R - B)
    y = vector de enteros, 1 = glaucoma, 0 = normal
    """
    # Se filtra por sufijo en minúsculas para no perder los .JPG en mayúsculas.
    rutas = sorted(p for p in Path(carpeta).iterdir()
                   if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
    if not rutas:
        sys.exit(f"No hay imágenes en {carpeta}")

    anchos, pesos, colores, etiquetas = [], [], [], []
    for p in rutas:
        with Image.open(p) as im:
            anchos.append(im.size[0])
            # Se reduce antes de promediar: el color medio no depende de la
            # resolución y así el barrido tarda segundos en vez de minutos.
            a = np.asarray(im.convert("RGB").resize((64, 64)), dtype=np.float32)
        pesos.append(os.path.getsize(p))
        colores.append(a[..., 0].mean() - a[..., 2].mean())
        etiquetas.append(1 if "_g_" in p.name else 0)

    X = np.column_stack([anchos, pesos, colores]).astype(np.float64)
    y = np.array(etiquetas, dtype=np.int32)
    return X, y


def mejor_umbral(v, y):
    """
    Busca el umbral que maximiza el acierto de la regla "v >= t -> glaucoma",
    probando también la regla invertida.

    Salida: (acierto, umbral, signo) con signo = +1 o -1.
    """
    mejor = (0.0, None, 1)
    for t in np.unique(v):
        for signo in (1, -1):
            acc = float((((v - t) * signo >= 0).astype(np.int32) == y).mean())
            if acc > mejor[0]:
                mejor = (acc, float(t), signo)
    return mejor


def evaluar(v, y):
    """
    Acierto in-sample y acierto held-out promediado sobre N particiones
    estratificadas: el umbral se ajusta en entrenamiento y se mide en prueba.

    El generador se crea aquí, con la misma semilla para cada variable, así
    que los tres atajos se evalúan sobre exactamente las mismas particiones
    y sus cifras son comparables entre sí.
    """
    rng = np.random.default_rng(SEMILLA)
    acc_in, _, _ = mejor_umbral(v, y)

    idx_pos = np.flatnonzero(y == 1)
    idx_neg = np.flatnonzero(y == 0)
    aciertos = []
    for _ in range(N_PARTICIONES):
        tr = []
        for idx in (idx_pos, idx_neg):
            perm = rng.permutation(idx)
            corte = int(round(FRAC_ENTRENAMIENTO * len(idx)))
            tr.append(perm[:corte])
        tr = np.concatenate(tr)
        mascara = np.zeros(len(y), dtype=bool)
        mascara[tr] = True

        _, t, signo = mejor_umbral(v[mascara], y[mascara])
        pred = ((v[~mascara] - t) * signo >= 0).astype(np.int32)
        aciertos.append(float((pred == y[~mascara]).mean()))

    return acc_in, float(np.mean(aciertos)), float(np.std(aciertos))


def main():
    carpeta = sys.argv[1] if len(sys.argv) > 1 else "acrima_mini"
    X, y = cargar(carpeta)

    n_g = int(y.sum())
    mayoritaria = max(n_g, len(y) - n_g) / len(y)

    print(f"Imágenes                 : {len(y)}  ({n_g} glaucoma / {len(y) - n_g} normal)")
    print(f"Clasificador tonto       : {mayoritaria:.1%}  (siempre la clase mayoritaria)")
    print()
    print(f"{'atajo':<26}{'in-sample':>11}{'held-out':>19}")
    print(f"{'':<26}{'(optimista)':>11}{'(70/30, ' + str(N_PARTICIONES) + ' repes)':>19}")
    print("-" * 56)

    for nombre, col in [("ancho de la imagen", 0),
                        ("peso del archivo", 1),
                        ("color medio (R - B)", 2)]:
        acc_in, acc_out, sd = evaluar(X[:, col], y)
        print(f"{nombre:<26}{acc_in:>10.1%}{acc_out:>13.1%} ± {sd:.1%}")

    print()
    print("El umbral in-sample se elige mirando las mismas imágenes que luego")
    print("se puntúan, así que sobreestima. La columna held-out es la que vale.")


if __name__ == "__main__":
    main()
