# Reconocer dígitos: elegir kernel, C y gamma con validación; prueba final aparte.
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

digitos = load_digits()  # 1797 imágenes de 8 x 8; cada fila contiene 64 píxeles.
X, y = digitos.data, digitos.target
X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_dev, y_dev, test_size=0.25, random_state=1, stratify=y_dev)
print(f"Imágenes: entrenamiento={len(y_train)}, validación={len(y_val)}, prueba={len(y_test)}")

# Pipeline aprende medias y escalas solo al hacer fit con entrenamiento.
# La misma transformación se aplica después a validación y prueba.
CS = [0.01, 1, 100]
GAMMAS = ["scale", 0.001, 0.1]  # scale depende de la varianza DESPUÉS de escalar.
print("Kernel | C | gamma | acierto validación")
mejor = None
for kernel in ["linear", "rbf"]:
    for C in CS:
        for gamma in (["scale"] if kernel == "linear" else GAMMAS):
            modelo = make_pipeline(StandardScaler(), SVC(kernel=kernel, C=C, gamma=gamma, class_weight=None))
            modelo.fit(X_train, y_train)
            acierto = modelo.score(X_val, y_val)
            gamma_texto = "no aplica" if kernel == "linear" else str(gamma)
            print(f"{kernel} | {C:g} | {gamma_texto} | {acierto:.1%}")
            if mejor is None or acierto > mejor[0]:
                mejor = (acierto, kernel, C, gamma, modelo)

acierto, kernel, C, gamma, modelo = mejor
print(f"\nElegido con validación: kernel={kernel}, C={C:g}, gamma={gamma if kernel == 'rbf' else 'no aplica'}")
# Una sola predicción sobre la prueba final; no cambia los ajustes elegidos.
prediccion = modelo.predict(X_test)
errores = np.flatnonzero(prediccion != y_test)
print(f"Prueba final: {np.mean(prediccion == y_test):.1%}, errores={len(errores)} de {len(y_test)}")
print(f"Vectores de soporte: {modelo.named_steps['svc'].n_support_.sum()} de {len(y_train)} imágenes de entrenamiento")
print("El acierto de validación elige los ajustes; el de prueba estima el resultado final.")

# Mostrar hasta tres casos de la prueba; si no hay errores, mostrar aciertos.
indices = errores[:3] if len(errores) else np.arange(3)
fig, ejes = plt.subplots(1, len(indices), figsize=(4.5, 1.8), squeeze=False)
for eje, i in zip(ejes.flat, indices):
    eje.imshow(X_test[i].reshape(8, 8), cmap="gray")
    eje.set_title(f"{y_test[i]} → {prediccion[i]}")
    eje.axis("off")
plt.tight_layout()
plt.show()
