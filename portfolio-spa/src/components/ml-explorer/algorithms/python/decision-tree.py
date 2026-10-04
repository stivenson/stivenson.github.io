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
X_train, X_test, y_train, y_test = train_test_split(X, impago, test_size=0.3, random_state=0)

arbol = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
print(export_text(arbol, feature_names=["ingreso", "deuda", "atrasos"], class_names=["paga", "impago"]))

print("Profundidad | exactitud entrenamiento | exactitud datos nuevos")
for prof in [1, 3, 5, 15]:
    a = DecisionTreeClassifier(max_depth=prof, random_state=0).fit(X_train, y_train)
    print(f"{prof:>11} | {a.score(X_train, y_train):>23.1%} | {a.score(X_test, y_test):>22.1%}")
