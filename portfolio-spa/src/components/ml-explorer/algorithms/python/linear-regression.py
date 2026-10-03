# Precio de casas: ¿cuánto suma cada m² y cada habitación?
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

rng = np.random.default_rng(42)
n = 200
area = rng.uniform(40, 200, n)          # m²
habitaciones = rng.integers(1, 6, n)    # de 1 a 5
# Precio "real" en millones: base + 2.5 por m² + 15 por habitación + ruido
precio = 80 + 2.5 * area + 15 * habitaciones + rng.normal(0, 25, n)

X = np.column_stack([area, habitaciones])
X_train, X_test, y_train, y_test = train_test_split(X, precio, test_size=0.25, random_state=0)

modelo = LinearRegression().fit(X_train, y_train)
pred = modelo.predict(X_test)

print(f"Intercepto b0: {modelo.intercept_:.1f}")
print(f"Por cada m² (b1): {modelo.coef_[0]:.2f}")
print(f"Por cada habitación (b2): {modelo.coef_[1]:.1f}")
print(f"R² con casas que no vio: {r2_score(y_test, pred):.3f}")
print(f"Error medio: {mean_absolute_error(y_test, pred):.1f} millones")
print(f"Casa de 120 m² y 3 habitaciones: {modelo.predict([[120, 3]])[0]:.0f} millones")

plt.figure(figsize=(4.5, 3.2))
plt.scatter(y_test, pred, s=14)
lims = [y_test.min(), y_test.max()]
plt.plot(lims, lims, "--", color="gray")
plt.xlabel("Precio real")
plt.ylabel("Precio predicho")
plt.title("Más cerca de la diagonal = mejor")
plt.show()
