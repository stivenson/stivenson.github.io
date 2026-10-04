# Segmentación de clientes: K-Means arma grupos sin que nadie le diga cuáles
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(7)
# 300 clientes: gasto mensual (miles de pesos) y visitas al mes. Sin etiquetas:
# los datos no dicen a qué grupo pertenece cada cliente.
perfiles = [(120, 2), (450, 4), (300, 12)]
X = np.vstack([rng.normal(p, (40, 1.2), size=(100, 2)) for p in perfiles])
Xs = StandardScaler().fit_transform(X)  # sin escalar, el gasto taparía las visitas

print("K | inercia | silueta")
for k in range(1, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)
    silueta = f"{silhouette_score(Xs, km.labels_):.2f}" if k > 1 else "  —"
    print(f"{k} | {km.inertia_:7.1f} | {silueta}")

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Xs)
print("\nSegmentos con K = 3 (de menor a mayor gasto):")
for c in np.argsort([X[km.labels_ == c, 0].mean() for c in range(3)], kind="stable"):
    grupo = X[km.labels_ == c]
    gasto, visitas = grupo.mean(axis=0)
    print(f"  {len(grupo):3d} clientes | gasto {gasto:3.0f} mil | {visitas:4.1f} visitas al mes")
