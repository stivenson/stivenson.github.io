# Recomendador: ¿qué película ver? Lo que les gustó a los usuarios más parecidos a Ana
import numpy as np
from sklearn.neighbors import NearestNeighbors

peliculas = ["Toy Story", "Alien", "Titanic", "Matrix", "Coco", "Interestelar"]
# Calificaciones de 1 a 5 (0 = no la ha visto)
usuarios = {
    "Ana":  [5, 0, 4, 0, 5, 0],
    "Beto": [5, 1, 4, 2, 5, 2],
    "Caro": [1, 5, 1, 5, 1, 5],
    "Dani": [4, 1, 5, 1, 4, 4],
    "Eva":  [2, 5, 1, 5, 2, 4],
    "Fer":  [5, 2, 5, 1, 4, 5],
}
nombres = list(usuarios)
R = np.array(list(usuarios.values()), dtype=float)
vistas = R[0] > 0  # comparamos solo con las películas que Ana ya calificó

knn = NearestNeighbors(n_neighbors=3, metric="euclidean").fit(R[1:][:, vistas])
dist, idx = knn.kneighbors(R[0:1, vistas])
vecinos = idx[0] + 1  # +1 porque Ana (fila 0) quedó fuera del ajuste

for i, d in zip(vecinos, dist[0]):
    print(f"Vecino: {nombres[i]:<5} distancia = {d:.2f}")

# Aquí los 3 vecinos vieron las 6 películas; si alguno tuviera un 0, contaría como nota mínima y habría que excluirlo.
puntaje = R[vecinos].mean(axis=0)
print("\nRecomendaciones para Ana (promedio de sus 3 vecinos):")
for j in np.argsort(-puntaje, kind="stable"):  # estable: los empates salen en orden fijo
    if not vistas[j]:
        print(f"  {peliculas[j]:<13} {puntaje[j]:.1f} / 5")
