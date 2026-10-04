# Clustering geoespacial: ¿dónde se concentran los reportes de huecos en la vía?
import numpy as np
from sklearn.cluster import DBSCAN, KMeans

rng = np.random.default_rng(5)
R = 6371.0  # radio de la Tierra en km
lat0, lon0 = 10.98, -74.80  # un punto de referencia en la ciudad
km = lambda n, s: rng.normal(0, s, size=(n, 2))  # n puntos dispersos s km

# Coordenadas en km respecto al punto de referencia:
barrio = km(40, 0.15) + [1.0, 1.0]  # zona compacta
t = rng.uniform(0, 3, size=60)  # avenida: franja larga y angosta
avenida = np.c_[t - 2.0, 0.6 * t - 1.5] + km(60, 0.05)
mercado = km(30, 0.12) + [-1.5, 1.8]
sueltos = rng.uniform(-3, 3, size=(15, 2))  # reportes aislados
xy = np.vstack([barrio, avenida, mercado, sueltos])
grados = np.c_[lat0 + np.degrees(xy[:, 1] / R), lon0 + np.degrees(xy[:, 0] / (R * np.cos(np.radians(lat0))))]
print(f"{len(grados)} reportes (latitud, longitud)")

# La distancia haversine trabaja en radianes sobre la esfera: eps en metros ÷ 1000 ÷ R.
for metros in (150, 300, 800):
    db = DBSCAN(eps=metros / 1000 / R, min_samples=5, metric="haversine").fit(np.radians(grados))
    zonas = sorted(np.bincount(db.labels_[db.labels_ >= 0]).tolist(), reverse=True)
    print(f"eps = {metros:3d} m → {len(zonas)} zonas {zonas}, ruido: {np.sum(db.labels_ == -1)}")

km3 = KMeans(n_clusters=3, n_init=10, random_state=0).fit(xy)  # K-Means en km
en_avenida = km3.labels_[40:100]
partidos = np.sum(en_avenida != np.bincount(en_avenida).argmax())
lejos = np.linalg.norm(sueltos - km3.cluster_centers_[km3.labels_[-15:]], axis=1)
print(f"\nK-Means (K = 3) manda {partidos} de los 60 reportes de la avenida a otra zona")
print(f"y mete los 15 aislados en alguna zona: el más lejano queda a {lejos.max():.1f} km de su centro")
