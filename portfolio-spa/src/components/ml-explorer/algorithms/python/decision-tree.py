# ¿Pagará el préstamo? Un árbol que se lee como reglas "si... entonces..."
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(3)
n = 500
ingreso = rng.uniform(1, 12, n).round(1)   # millones al mes
deuda = rng.uniform(0, 0.9, n).round(2)    # fracción del ingreso ya comprometida
atrasos = rng.poisson(0.8, n)              # pagos atrasados el último año
riesgo = 0.6 * deuda + 0.15 * atrasos - 0.04 * ingreso + rng.normal(0, 0.08, n)
impago = (riesgo > 0.25).astype(int)
# 12 % de etiquetas al azar: en la vida real hay casos que ninguna regla explica
ruido = rng.random(n) < 0.12
impago[ruido] = 1 - impago[ruido]

X = np.column_stack([ingreso, deuda, atrasos])
# 300 para entrenar, 100 para elegir ajustes y 100 para la prueba final.
X_dev, X_test, y_dev, y_test = train_test_split(X, impago, test_size=0.2, random_state=0)
X_train, X_val, y_train, y_val = train_test_split(X_dev, y_dev, test_size=0.25, random_state=1)

# Hiperparámetros: los cortes y las clases de cada hoja se aprenden después.
PROFUNDIDADES = [1, 3, 5, 15]  # max_depth
MINIMOS_POR_HOJA = [1, 4, 10]  # min_samples_leaf
FIJOS = dict(criterion="gini", min_samples_split=2, ccp_alpha=0.0, random_state=0)

print(f"Ejemplos: entrenamiento={len(y_train)}, validación={len(y_val)}, prueba={len(y_test)}")
print("Profundidad | mínimo hoja | hojas | acierto entrenamiento | acierto validación")
candidatos = []
for prof in PROFUNDIDADES:
    for minimo in MINIMOS_POR_HOJA:
        a = DecisionTreeClassifier(max_depth=prof, min_samples_leaf=minimo, **FIJOS).fit(X_train, y_train)
        validacion = a.score(X_val, y_val)
        candidatos.append((validacion, -a.get_n_leaves(), -prof, -minimo, a))
        print(f"{prof:>11} | {minimo:>11} | {a.get_n_leaves():>5} | {a.score(X_train, y_train):>21.1%} | {validacion:>18.1%}")

# Primero validación; en empate, menos hojas y luego menores límites numéricos.
# La prueba final no interviene en esta selección.
mejor = max(candidatos, key=lambda c: c[:4])[-1]
print(f"\nElegido con validación: max_depth={mejor.max_depth}, min_samples_leaf={mejor.min_samples_leaf}")
print(f"Profundidad alcanzada={mejor.get_depth()}, hojas={mejor.get_n_leaves()}")
print(export_text(mejor, feature_names=["ingreso", "deuda", "atrasos"], class_names=["paga", "impago"]))
print(f"Prueba final (una configuración): {mejor.score(X_test, y_test):.1%}")
print("Una partición simulada ilustra el método; no garantiza rendimiento en una aplicación real.")
