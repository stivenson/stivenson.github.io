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
# 600 para entrenar, 200 para elegir ajustes y 200 para la prueba final.
X_dev, X_test, y_dev, y_test = train_test_split(X, fraude, test_size=0.2, random_state=0, stratify=fraude)
X_train, X_val, y_train, y_val = train_test_split(X_dev, y_dev, test_size=0.25, random_state=1, stratify=y_dev)

# Los cinco ajustes principales; la semilla facilita reproducir, no mejorar.
TAMANOS = [10, 100]  # n_estimators
PROFUNDIDADES = [3, None]  # max_depth
MINIMOS_POR_HOJA = [1, 5]  # min_samples_leaf
VARIABLES_POR_CORTE = ["sqrt", None]  # max_features; None considera todas
BOOTSTRAP = True
FIJOS = dict(criterion="gini", min_samples_split=2, ccp_alpha=0.0,
             class_weight=None, random_state=0, n_jobs=1)

print(f"Compras: entrenamiento={len(y_train)}, validación={len(y_val)}, prueba={len(y_test)}")
mayoria = int(np.bincount(y_train).argmax())
print(f"Línea base: siempre clase {mayoria}, validación {(y_val == mayoria).mean():.1%}")
arbol = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
print(f"Un árbol: entrenamiento {arbol.score(X_train, y_train):.1%} | validación {arbol.score(X_val, y_val):.1%}")
print("Árboles | profundidad | mínimo hoja | variables | bootstrap | acierto validación")
candidatos = []
configuraciones = [(n, d, m, f, BOOTSTRAP) for n in TAMANOS for d in PROFUNDIDADES
                   for m in MINIMOS_POR_HOJA for f in VARIABLES_POR_CORTE]
# Contraste adicional: sin muestreo y con todas las variables por corte.
configuraciones.append((100, None, 1, None, False))
for n_arboles, prof, minimo, variables, muestreo in configuraciones:
    bosque = RandomForestClassifier(n_estimators=n_arboles, max_depth=prof,
        min_samples_leaf=minimo, max_features=variables, bootstrap=muestreo, **FIJOS).fit(X_train, y_train)
    score = bosque.score(X_val, y_val)
    nodos = sum(a.tree_.node_count for a in bosque.estimators_)
    candidatos.append((score, -nodos, -n_arboles, bosque))
    print(f"{n_arboles:>7} | {str(prof):>11} | {minimo:>11} | {str(variables):>9} | {str(muestreo):>9} | {score:>18.1%}")

# En empate, prefiere menos nodos y luego menos árboles; nunca mira la prueba.
mejor = max(candidatos, key=lambda c: c[:3])[-1]
print(f"\nElegido: árboles={mejor.n_estimators}, profundidad={mejor.max_depth}, mínimo hoja={mejor.min_samples_leaf}, variables={mejor.max_features}, bootstrap={mejor.bootstrap}")
print(f"Elegido: entrenamiento {mejor.score(X_train, y_train):.1%} | validación {mejor.score(X_val, y_val):.1%}")
# Inspección con validación: la prueba final sigue reservada.
perm = permutation_importance(mejor, X_val, y_val, n_repeats=5, random_state=0)
print("\nImportancia de cada señal: impureza | permutación en validación")
for j in np.argsort(-perm.importances_mean, kind="stable"):
    print(f"  {nombres[j]:<11} {mejor.feature_importances_[j]:.2f} | {perm.importances_mean[j]:.3f}")
print(f"\nPrueba final (una configuración): {mejor.score(X_test, y_test):.1%}")
print("No confundas probabilidad, acierto e importancia. Estas compras son simuladas.")
