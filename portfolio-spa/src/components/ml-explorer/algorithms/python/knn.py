# Recomendador: ¿qué película ver? Lo que les gustó a los usuarios más parecidos a Ana
import numpy as np
from sklearn.neighbors import NearestNeighbors, KNeighborsRegressor, KNeighborsClassifier
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

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

# Todos los vecinos tienen las notas objetivo. Un 0 significa ausente: no debe tratarse como una nota.
# Este ejemplo pequeño ilustra el promedio; no permite elegir ajustes por acierto.
puntaje = R[vecinos].mean(axis=0)
print("\nRecomendaciones para Ana (promedio de sus 3 vecinos):")
for j in np.argsort(-puntaje, kind="stable"):  # estable: los empates salen en orden fijo
    if not vistas[j]:
        print(f"  {peliculas[j]:<13} {puntaje[j]:.1f} / 5")

# Mismos 3 vecinos; cambiar weights modifica cómo se promedian sus notas.
# Beto coincide exactamente con Ana en las tres columnas usadas para buscar.
print("\nPromedios para películas no vistas, con k=3 y distancia euclidiana:")
for weights in ["uniform", "distance"]:
    modelo = KNeighborsRegressor(n_neighbors=3, weights=weights, metric="minkowski", p=2, algorithm="brute")
    modelo.fit(R[1:][:, vistas], R[1:][:, ~vistas])
    notas = modelo.predict(R[0:1, vistas])[0]
    print(f"weights={weights}: " + ", ".join(f"{nombre}={nota:.1f}" for nombre, nota in zip(np.array(peliculas)[~vistas], notas)))
print("Con distancia cero, distance usa solo coincidencias exactas entre los vecinos seleccionados.")

# Comparación evaluada aparte: clasificar 178 muestras de vino con 13 mediciones.
# No valida el recomendador de películas: es otro problema, ahora de clasificación.
datos = load_wine()
X_dev, X_test, y_dev, y_test = train_test_split(datos.data, datos.target, test_size=0.2, random_state=0, stratify=datos.target)
X_train, X_val, y_train, y_val = train_test_split(X_dev, y_dev, test_size=0.25, random_state=1, stratify=y_dev)
print(f"\nClasificación: entrenamiento={len(y_train)}, validación={len(y_val)}, prueba={len(y_test)}")
print("k | weights | p | acierto validación")
mejor = None
for k in [1, 5, 11]:
    for weights in ["uniform", "distance"]:
        for p in [1, 2]:
            # Escalas aprendidas solo con entrenamiento; mismas transformaciones en validación.
            modelo = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k, weights=weights, metric="minkowski", p=p, algorithm="brute"))
            modelo.fit(X_train, y_train)
            acierto = modelo.score(X_val, y_val)
            print(f"{k} | {weights} | {p} | {acierto:.1%}")
            if mejor is None or acierto > mejor[0]:
                mejor = (acierto, k, weights, p, modelo)

acierto, k, weights, p, modelo = mejor
print(f"\nElegido con validación: k={k}, weights={weights}, p={p}")
# Comparar métodos de búsqueda exacta con los mismos ajustes; no cambia la regla de voto.
alternativo = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k, weights=weights, metric="minkowski", p=p, algorithm="kd_tree"))
alternativo.fit(X_train, y_train)
print(f"brute y kd_tree coinciden en validación: {np.array_equal(modelo.predict(X_val), alternativo.predict(X_val))}")
# Una sola consulta de la prueba final; no se eligen ajustes mirando su resultado.
prediccion = modelo.predict(X_test)
print(f"Prueba final: {np.mean(prediccion == y_test):.1%}, errores={np.sum(prediccion != y_test)} de {len(y_test)}")
