# Reconocer dígitos escritos a mano (imágenes de 8×8 píxeles): SVM lineal contra kernel RBF
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

digitos = load_digits()                  # 1797 imágenes, viene incluido en scikit-learn
X = digitos.data / 16                    # 64 píxeles por imagen, escalados a [0, 1]
y = digitos.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
print(f"{len(X_tr)} imágenes para entrenar, {len(X_te)} nuevas para probar")

print("\nKernel  C      acierto en nuevas  vectores de soporte")
for kernel in ["linear", "rbf"]:
    for C in [0.01, 1, 100]:
        svm = SVC(kernel=kernel, C=C).fit(X_tr, y_tr)
        print(f"{kernel:<7} {C:<6} {svm.score(X_te, y_te):>17.1%}  {svm.n_support_.sum():>19}")

svm = SVC(kernel="rbf", C=1).fit(X_tr, y_tr)
errores = np.flatnonzero(svm.predict(X_te) != y_te)
print(f"\nCon RBF y C = 1 falla {len(errores)} de {len(y_te)}. Por ejemplo:")
for i in errores[:3]:
    print(f"  era un {y_te[i]}, dijo {svm.predict(X_te[i:i + 1])[0]}")

fig, ejes = plt.subplots(1, 3, figsize=(4.5, 1.8))
for eje, i in zip(ejes, errores[:3]):
    eje.imshow(X_te[i].reshape(8, 8), cmap="gray")
    eje.set_title(f"{y_te[i]} → {svm.predict(X_te[i:i + 1])[0]}")
    eje.axis("off")
plt.show()
