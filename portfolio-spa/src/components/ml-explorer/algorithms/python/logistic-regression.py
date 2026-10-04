# Detector de spam: probabilidad de que un correo sea spam según 3 señales
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

rng = np.random.default_rng(7)
n = 400
es_spam = rng.random(n) < 0.4
gratis = np.where(es_spam, rng.poisson(3, n), rng.poisson(0.3, n))     # veces que dice "gratis"
enlaces = np.where(es_spam, rng.poisson(5, n), rng.poisson(1.5, n))    # número de enlaces
conocido = np.where(es_spam, rng.random(n) < 0.1, rng.random(n) < 0.7).astype(int)  # remitente conocido

X = np.column_stack([gratis, enlaces, conocido])
y = es_spam.astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

modelo = LogisticRegression().fit(X_train, y_train)
pred = modelo.predict(X_test)

print("Pesos [gratis, enlaces, conocido]:", np.round(modelo.coef_[0], 2))
print(f"Intercepto b0: {modelo.intercept_[0]:.2f}")
print(f"Exactitud con correos nuevos: {accuracy_score(y_test, pred):.1%}")
print("Matriz de confusión (filas = real, columnas = predicho; 0 = normal, 1 = spam):")
print(confusion_matrix(y_test, pred))

correos = np.array([[0, 1, 1], [2, 4, 0], [5, 8, 0]])
for c, p in zip(correos, modelo.predict_proba(correos)[:, 1]):
    print(f"gratis={c[0]} enlaces={c[1]} conocido={c[2]} -> P(spam) = {p:.1%}")
