# Scoring de crédito: cada árbol nuevo corrige los errores de los anteriores. ¿Cuándo parar?
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(3)
n = 800
ingreso = rng.normal(4, 1.5, n).clip(0.8)          # millones de pesos al mes
deuda = rng.uniform(0, 0.9, n)                      # deuda / ingreso
atrasos = rng.poisson(0.8, n)                       # pagos atrasados en el último año
edad = rng.integers(20, 70, n)
# Regla oculta (no lineal): la deuda pesa mucho más cuando el ingreso es bajo
riesgo = 3 * deuda * (ingreso < 3) + 1.2 * deuda + 0.7 * atrasos - 0.3 * ingreso + 0.6 * (edad < 25) - 1
impago = (rng.random(n) < 1 / (1 + np.exp(-riesgo))).astype(int)

X = np.column_stack([ingreso, deuda, atrasos, edad])
# Prueba aparte; las comparaciones solo miran entrenamiento y validación.
X_dev, X_test, y_dev, y_test = train_test_split(X, impago, test_size=0.2, random_state=0, stratify=impago)
X_train, X_val, y_train, y_val = train_test_split(X_dev, y_dev, test_size=0.25, random_state=1, stratify=y_dev)
TASAS = [0.03, 0.1, 0.3]
MAX_ARBOLES = 300
# Fijamos complejidad y muestreo para comparar tasa y cantidad de etapas.
FIJOS = dict(max_depth=3, min_samples_leaf=20, subsample=1.0,
             loss="log_loss", n_iter_no_change=None, random_state=0)

print(f"Clientes: entrenamiento={len(y_train)}, validación={len(y_val)}, prueba={len(y_test)}")
print("Tasa | árboles elegidos | pérdida validación")
resultados = []
for tasa in TASAS:
    modelo = GradientBoostingClassifier(n_estimators=MAX_ARBOLES, learning_rate=tasa, **FIJOS)
    modelo.fit(X_train, y_train)
    curva_val = [log_loss(y_val, p[:, 1]) for p in modelo.staged_predict_proba(X_val)]
    cantidad = int(np.argmin(curva_val)) + 1
    resultados.append((curva_val[cantidad - 1], tasa, cantidad, modelo, curva_val))
    print(f"{tasa:>4.2f} | {cantidad:>16} | {curva_val[cantidad - 1]:>18.3f}")

perdida, tasa, cantidad, modelo, curva_val = min(resultados, key=lambda fila: fila[0])
print(f"\nElegido con validación: tasa={tasa}, árboles={cantidad}, pérdida={perdida:.3f}")
# Se entrena otra vez con la misma parte de entrenamiento y los ajustes elegidos.
# La prueba se consulta una sola vez: no se eligen ajustes mirando su resultado.
final = GradientBoostingClassifier(n_estimators=cantidad, learning_rate=tasa, **FIJOS).fit(X_train, y_train)
print(f"Prueba final: pérdida={log_loss(y_test, final.predict_proba(X_test)[:, 1]):.3f}")
print("Fijos: profundidad=3, mínimo por hoja=20, subsample=1.0, pérdida=log_loss")

curva_train = [log_loss(y_train, p[:, 1]) for p in modelo.staged_predict_proba(X_train)]
plt.figure(figsize=(5, 3.2))
plt.plot(range(1, MAX_ARBOLES + 1), curva_train, label="entrenamiento")
plt.plot(range(1, MAX_ARBOLES + 1), curva_val, label="validación")
plt.axvline(cantidad, ls="--", c="gray", label="cantidad elegida")
plt.xlabel("número de árboles")
plt.ylabel("pérdida logarítmica")
plt.title(f"Comparar etapas con tasa {tasa}: prueba final aparte")
plt.legend()
plt.tight_layout()
plt.show()
