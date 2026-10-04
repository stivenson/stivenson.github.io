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
X_tr, X_te, y_tr, y_te = train_test_split(X, impago, test_size=0.3, random_state=0, stratify=impago)

# 300 árboles a propósito (el valor por defecto es 100), para ver qué pasa cuando sobran.
# min_samples_leaf=20: cada hoja debe tener al menos 20 clientes.
gb = GradientBoostingClassifier(
    n_estimators=300, learning_rate=0.1, max_depth=3, min_samples_leaf=20, random_state=0
)
gb.fit(X_tr, y_tr)

perdida_tr = [log_loss(y_tr, p[:, 1]) for p in gb.staged_predict_proba(X_tr)]
perdida_te = [log_loss(y_te, p[:, 1]) for p in gb.staged_predict_proba(X_te)]
mejor = int(np.argmin(perdida_te)) + 1

print(f"Impagos: {impago.sum()} de {n} clientes")
print("Árboles | pérdida entrenamiento | pérdida datos nuevos")
for m in [1, 10, 50, 100, 200, 300]:
    print(f"{m:>7} | {perdida_tr[m - 1]:>21.3f} | {perdida_te[m - 1]:>20.3f}")
print(f"\nMenor pérdida en datos nuevos: {perdida_te[mejor - 1]:.3f} con {mejor} árboles")

plt.figure(figsize=(4.5, 3.2))
plt.plot(range(1, 301), perdida_tr, label="entrenamiento")
plt.plot(range(1, 301), perdida_te, label="datos nuevos")
plt.axvline(mejor, ls="--", c="gray")
plt.xlabel("número de árboles")
plt.ylabel("pérdida logarítmica")
plt.title("Después de la línea gris, más árboles empeoran")
plt.legend()
plt.show()
