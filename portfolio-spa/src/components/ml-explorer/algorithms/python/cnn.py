# Detector de bordes: una convolución y un pooling hechos a mano con NumPy
import numpy as np

# Un «0» manuscrito real de scikit-learn: intensidad de 0 (fondo) a 16 (trazo)
imagen = np.array([
    [0, 0, 5, 13, 9, 1, 0, 0],
    [0, 0, 13, 15, 10, 15, 5, 0],
    [0, 3, 15, 2, 0, 11, 8, 0],
    [0, 4, 12, 0, 0, 8, 8, 0],
    [0, 5, 8, 0, 0, 9, 8, 0],
    [0, 4, 11, 0, 1, 12, 7, 0],
    [0, 2, 14, 5, 10, 12, 0, 0],
    [0, 0, 6, 13, 10, 0, 0, 0],
])

# Dos filtros (kernels) de 3×3: uno busca bordes verticales y otro horizontales
filtros = {
    "vertical": np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]),
    "horizontal": np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]]),
}


def convolucion(img, k):
    """Desliza el filtro por la imagen y suma los productos en cada posición."""
    alto, ancho = img.shape[0] - 2, img.shape[1] - 2
    salida = np.zeros((alto, ancho), dtype=int)
    for i in range(alto):
        for j in range(ancho):
            salida[i, j] = np.sum(img[i:i + 3, j:j + 3] * k)
    return salida


def max_pooling(mapa):
    """Se queda con el máximo de cada bloque de 2×2: el mapa se reduce a la mitad."""
    alto, ancho = mapa.shape[0] // 2, mapa.shape[1] // 2
    return mapa[:alto * 2, :ancho * 2].reshape(alto, 2, ancho, 2).max(axis=(1, 3))


for nombre, k in filtros.items():
    mapa = np.maximum(convolucion(imagen, k), 0)  # ReLU: los negativos pasan a 0
    print(f"Filtro {nombre}: mapa de activación {mapa.shape[0]}×{mapa.shape[1]} (tras ReLU)")
    print(mapa)
    print(f"Tras max pooling 2×2 ({max_pooling(mapa).shape[0]}×{max_pooling(mapa).shape[1]}):")
    print(max_pooling(mapa))
    print()

print("Pesos de un filtro de 3×3: 9, los mismos en las 36 posiciones")
print(f"Una capa densa de 64 píxeles a 36 salidas necesitaría {64 * 36} pesos")
