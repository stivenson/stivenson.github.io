# Dígitos escritos a mano: elegir hiperparámetros sin mirar la prueba final
import warnings

import numpy as np
from sklearn.datasets import load_digits
from sklearn.exceptions import ConvergenceWarning
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

X, y = load_digits(return_X_y=True)  # 1797 imágenes de 8×8 = 64 píxeles
X = X / 16  # escala conocida de los píxeles; no aprende estadísticas de la prueba
X_pool, X_te, y_pool, y_te = train_test_split(X, y, test_size=0.2, random_state=0, stratify=y)
X_tr, X_val, y_tr, y_val = train_test_split(X_pool, y_pool, test_size=0.25, random_state=1, stratify=y_pool)
print(f"Datos: entrenamiento={len(X_tr)}, validación={len(X_val)}, prueba={len(X_te)}")

# Se cambia tamaño, activación o penalización; el resto se conserva explícito.
candidatos = [(2, "relu", 0.0001), (8, "relu", 0.0001),
              (32, "relu", 0.0001), (32, "tanh", 0.0001), (32, "relu", 0.1)]
resultados = []
print("ID | ocultas | activación | alpha | parámetros | épocas | entrena | valida | límite")
for i, (n, activacion, penalizacion) in enumerate(candidatos, 1):
    red = MLPClassifier(hidden_layer_sizes=(n,), activation=activacion,
                        solver="adam", learning_rate_init=0.003, batch_size=64,
                        alpha=penalizacion, max_iter=150, tol=1e-4,
                        n_iter_no_change=15, early_stopping=False,
                        shuffle=True, random_state=0)
    # Se registra la advertencia; no se oculta un entrenamiento sin convergencia.
    with warnings.catch_warnings(record=True) as avisos:
        warnings.simplefilter("always", ConvergenceWarning)
        red.fit(X_tr, y_tr)
    advertencia = any(issubclass(a.category, ConvergenceWarning) for a in avisos)
    parametros = sum(W.size + b.size for W, b in zip(red.coefs_, red.intercepts_))
    validacion = red.score(X_val, y_val)
    resultados.append((validacion, i, red))
    print(f"{i:2d} | {n:7d} | {activacion:10s} | {penalizacion:.4f} | {parametros:10d} | {red.n_iter_:6d} | {red.score(X_tr, y_tr):7.1%} | {validacion:6.1%} | {str(red.n_iter_ == red.max_iter)}")
    if advertencia:
        print(f"   Aviso candidato {i}: alcanzó el presupuesto sin convergencia declarada.")

# En empate conserva el primer candidato. No reentrena ni selecciona con la prueba.
validacion, elegido, red = max(resultados, key=lambda item: item[0])
print(f"\nElegido con validación: candidato {elegido} ({validacion:.1%})")
predicciones = red.predict(X_te)  # único uso final de la prueba
acierto = np.mean(predicciones == y_te)
print(f"Prueba final: {acierto:.1%}, errores={np.sum(predicciones != y_te)} de {len(y_te)}")
print("Pesos y sesgos aprendidos:", sum(W.size + b.size for W, b in zip(red.coefs_, red.intercepts_)))
print("Los hiperparámetros se eligieron antes; coefs_ e intercepts_ se aprendieron con entrenamiento.")
print("n_iter_ cuenta épocas con Adam; llegar a max_iter no demuestra convergencia ni sobreajuste.")
