# Genes simulados: el agrupamiento jerárquico arma un árbol de parecidos
import matplotlib.pyplot as plt
import numpy as np
from scipy.cluster.hierarchy import cophenet, dendrogram, fcluster, linkage
from scipy.spatial.distance import pdist

rng = np.random.default_rng(3)
t = np.linspace(0, 1, 8)  # 8 mediciones en el tiempo
patrones = {"sube": t, "baja": 1 - t, "pico": np.exp(-((t - 0.5) ** 2) / 0.03)}
nombres, filas = [], []
for patron, curva in patrones.items():
    for i in range(4):  # 4 genes por patrón, con ruido
        nombres.append(f"{patron}-{i + 1}")
        filas.append(rng.uniform(1, 3) * curva + rng.normal(0, 0.15, size=8))
X = np.array(filas)

# Distancia = 1 − correlación: dos genes se parecen si suben y bajan juntos,
# aunque uno se exprese el triple que el otro.
Z = linkage(X, method="average", metric="correlation")
print("Últimas 4 uniones (altura = distancia a la que se unen):")
for a, b, altura, n in Z[-4:]:
    print(f"  altura {altura:.2f} → grupo de {int(n)} genes")

for k in (2, 3):
    grupos = fcluster(Z, t=k, criterion="maxclust")
    print(f"\nCortando en {k} grupos:")
    for g in range(1, k + 1):
        print(f"  grupo {g}: " + ", ".join(n for n, x in zip(nombres, grupos) if x == g))

c, _ = cophenet(Z, pdist(X, metric="correlation"))
print(f"\nCorrelación cofenética: {c:.2f} (cerca de 1 = el árbol respeta bien las distancias)")

plt.figure(figsize=(5, 3.2))
dendrogram(Z, labels=nombres, color_threshold=0.5)
plt.axhline(0.5, color="gray", linestyle="--")  # cortar aquí deja 3 grupos
plt.ylabel("distancia (1 − correlación)")
plt.title("Dendrograma de 12 genes")
plt.show()
