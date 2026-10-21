# Detector de spam: probabilidad de que un correo sea spam según 3 señales
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, log_loss

# Configuración de entrenamiento; el umbral se aplica después de predict_proba.
C_VALUE = 1.0
CLASS_WEIGHT = None
MAX_ITER = 200
THRESHOLD = 0.5

rng = np.random.default_rng(7)
n = 400
es_spam = rng.random(n) < 0.4
gratis = np.where(es_spam, rng.poisson(3, n), rng.poisson(0.3, n))     # veces que dice "gratis"
enlaces = np.where(es_spam, rng.poisson(5, n), rng.poisson(1.5, n))    # número de enlaces
conocido = np.where(es_spam, rng.random(n) < 0.1, rng.random(n) < 0.7).astype(int)  # remitente conocido

X = np.column_stack([gratis, enlaces, conocido])
y = es_spam.astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

# Comparaciones con validación: la prueba X_test no participa en estas tablas.
X_fit, X_val, y_fit, y_val = train_test_split(
    X_train, y_train, test_size=0.2, random_state=1, stratify=y_train
)
print("Comparación de C en validación (menor pérdida logarítmica es mejor):")
for valor_C in [0.1, 1.0, 10.0]:
    candidato = LogisticRegression(C=valor_C, class_weight=CLASS_WEIGHT, max_iter=MAX_ITER).fit(X_fit, y_fit)
    p_val = candidato.predict_proba(X_val)[:, 1]
    print(f"  C={valor_C:g}: pérdida={log_loss(y_val, p_val):.4f}; norma de coeficientes={np.linalg.norm(candidato.coef_):.2f}")

# Un solo ajuste; cambiar el umbral reutiliza las mismas probabilidades.
ajuste_val = LogisticRegression(C=C_VALUE, class_weight=CLASS_WEIGHT, max_iter=MAX_ITER).fit(X_fit, y_fit)
p_val = ajuste_val.predict_proba(X_val)[:, 1]
print("Umbral en validación: falsas alarmas / spam que se escapan")
for umbral in [0.3, 0.5, 0.7]:
    decisiones = (p_val >= umbral).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_val, decisiones, labels=[0, 1]).ravel()
    print(f"  umbral={umbral:.1f}: {fp} / {fn}")
print("Esta demostración conserva C_VALUE y THRESHOLD fijados arriba; no los elige con la prueba.")

# Ajuste final con entrenamiento completo y evaluación en prueba separada.
modelo = LogisticRegression(C=C_VALUE, class_weight=CLASS_WEIGHT, max_iter=MAX_ITER).fit(X_train, y_train)
pred = (modelo.predict_proba(X_test)[:, 1] >= THRESHOLD).astype(int)
print("\nEvaluación final con la configuración fijada:")

print("Pesos [gratis, enlaces, conocido]:", np.round(modelo.coef_[0], 2))
print(f"Intercepto b0: {modelo.intercept_[0]:.2f}")
print(f"Exactitud con correos nuevos: {accuracy_score(y_test, pred):.1%}")
print("Matriz de confusión (filas = real, columnas = predicho; 0 = normal, 1 = spam):")
print(confusion_matrix(y_test, pred))

correos = np.array([[0, 1, 1], [2, 4, 0], [5, 8, 0]])
for c, p in zip(correos, modelo.predict_proba(correos)[:, 1]):
    print(f"gratis={c[0]} enlaces={c[1]} conocido={c[2]} -> P(spam) = {p:.1%}")
