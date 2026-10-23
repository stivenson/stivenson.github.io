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
    km = KMeans(n_clusters=k, init="k-means++", n_init=10, max_iter=300, tol=1e-4, random_state=0, algorithm="lloyd").fit(Xs)
    silueta = f"{silhouette_score(Xs, km.labels_):.2f}" if k > 1 else "  —"
    print(f"{k} | {km.inertia_:7.1f} | {silueta}")

km = KMeans(n_clusters=3, init="k-means++", n_init=10, max_iter=300, tol=1e-4, random_state=0, algorithm="lloyd").fit(Xs)
print("\nSegmentos con K = 3 (de menor a mayor gasto):")
for c in np.argsort([X[km.labels_ == c, 0].mean() for c in range(3)], kind="stable"):
    grupo = X[km.labels_ == c]
    gasto, visitas = grupo.mean(axis=0)
    print(f"  {len(grupo):3d} clientes | gasto {gasto:3.0f} mil | {visitas:4.1f} visitas al mes")

# K fijo: cada fila cambia el arranque o el presupuesto, no descubre K.
print("\nK=3 fijo | init | n_init | iteraciones del elegido | inercia")
for inicio in ["random", "k-means++"]:
    for arranques in [1, 10]:
        modelo = KMeans(n_clusters=3, init=inicio, n_init=arranques,
                        max_iter=300, tol=1e-4, random_state=0, algorithm="lloyd").fit(Xs)
        print(f"{inicio:10s} | {arranques:2d} | {modelo.n_iter_:2d} | {modelo.inertia_:.1f}")

print("\nParada: mismo inicio explícito, un arranque")
# Centros deliberadamente cercanos para observar el efecto del límite.
centros = Xs[:3].copy()
for limite, tolerancia in [(1, 0.0), (300, 0.0), (300, 0.1)]:
    modelo = KMeans(n_clusters=3, init=centros, n_init=1, max_iter=limite,
                    tol=tolerancia, random_state=0, algorithm="lloyd").fit(Xs)
    print(f"max_iter={limite:3d}, tol={tolerancia:.1f}: n_iter_={modelo.n_iter_:2d}, inercia={modelo.inertia_:.1f}")
print("Llegar a max_iter no demuestra convergencia; n_iter_ tampoco da el motivo exacto de parada.")
print("Compara inercia solo con los mismos datos y escala. No es acierto ni utilidad comercial.")
