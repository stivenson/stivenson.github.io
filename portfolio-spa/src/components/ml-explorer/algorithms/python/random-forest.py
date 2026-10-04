# Detector de fraude: un árbol solo contra un bosque de 100 árboles, y qué señales pesan más
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

rng = np.random.default_rng(7)
n = 1000
monto = rng.exponential(80, n)            # monto de la compra (miles de pesos)
hora = rng.integers(0, 24, n)             # hora del día (0 a 23)
distancia = rng.exponential(10, n)        # km desde la ciudad habitual del cliente
intentos = rng.poisson(0.4, n)            # intentos fallidos de clave antes de la compra
antiguedad = rng.integers(1, 120, n)      # meses de la tarjeta: NO influye en el fraude
# Regla oculta: el fraude sube con monto alto, madrugada, lejos de casa e intentos fallidos
riesgo = 0.03 * monto + 2.5 * (hora < 6) + 0.12 * distancia + 1.5 * intentos - 6
fraude = (rng.random(n) < 1 / (1 + np.exp(-riesgo))).astype(int)

X = np.column_stack([monto, hora, distancia, intentos, antiguedad])
nombres = ["monto", "hora", "distancia", "intentos", "antigüedad"]
X_tr, X_te, y_tr, y_te = train_test_split(X, fraude, test_size=0.3, random_state=0, stratify=fraude)

arbol = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)
bosque = RandomForestClassifier(n_estimators=100, random_state=0).fit(X_tr, y_tr)
print(f"Fraudes: {fraude.sum()} de {n} compras ({fraude.mean():.0%})")
print(f"Un árbol solo   → entrenamiento {arbol.score(X_tr, y_tr):.1%} | datos nuevos {arbol.score(X_te, y_te):.1%}")
print(f"Bosque de 100   → entrenamiento {bosque.score(X_tr, y_tr):.1%} | datos nuevos {bosque.score(X_te, y_te):.1%}")

perm = permutation_importance(bosque, X_te, y_te, n_repeats=5, random_state=0)
print("\nImportancia de cada señal      impureza  permutación")
for j in np.argsort(-perm.importances_mean, kind="stable"):
    print(f"  {nombres[j]:<11}                  {bosque.feature_importances_[j]:.2f}       {perm.importances_mean[j]:.3f}")
