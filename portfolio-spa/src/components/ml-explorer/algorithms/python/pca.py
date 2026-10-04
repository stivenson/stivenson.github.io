# Compresión de imágenes: PCA guarda cada dígito con k números en vez de 64
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

X = load_digits().data  # 1797 imágenes de 8×8 píxeles; cada píxel va de 0 a 16
print(f"{X.shape[0]} imágenes de {X.shape[1]} píxeles")

pca = PCA().fit(X)
V, media = pca.components_, pca.mean_
retenida = np.cumsum(pca.explained_variance_ratio_)


def comprimir(k):
    codigo = (X - media) @ V[:k].T  # k números por imagen
    return media + codigo @ V[:k]  # imagen reconstruida desde esos k números


print("\nk números | varianza retenida | error típico por píxel")
for k in (1, 2, 5, 10, 20, 40):
    error = np.sqrt(np.mean((X - comprimir(k)) ** 2))  # raíz del error cuadrático medio
    print(f"{k:9d} | {retenida[k - 1]:16.0%} | {error:21.2f}")
print(f"\nPara retener el 90 % bastan {np.searchsorted(retenida, 0.90) + 1} de 64 componentes")

fig, ejes = plt.subplots(1, 5, figsize=(7, 1.8))
for eje, k in zip(ejes, (64, 2, 5, 10, 20)):
    eje.imshow((X if k == 64 else comprimir(k))[0].reshape(8, 8), cmap="gray_r")
    eje.set_title("original" if k == 64 else f"k = {k}")
    eje.axis("off")
plt.show()
