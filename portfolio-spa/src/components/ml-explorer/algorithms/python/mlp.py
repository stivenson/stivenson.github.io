# Dígitos escritos a mano: una red neuronal (MLP) con una capa oculta
import warnings

import numpy as np
from sklearn.datasets import load_digits
from sklearn.exceptions import ConvergenceWarning
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

# Cada red entrena 150 épocas y para ahí, aunque podría mejorar un poco más: es a propósito.
warnings.filterwarnings("ignore", category=ConvergenceWarning)

X, y = load_digits(return_X_y=True)  # 1797 imágenes de 8×8 = 64 píxeles
X = X / 16  # cada píxel pasa de 0-16 a 0-1
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
print(f"{len(X_tr)} imágenes para entrenar y {len(X_te)} nuevas para medir\n")

print("neuronas ocultas | pesos | entrenamiento | datos nuevos")
for n in (2, 8, 32):
    red = MLPClassifier(hidden_layer_sizes=(n,), max_iter=150, random_state=0).fit(X_tr, y_tr)
    pesos = sum(W.size + b.size for W, b in zip(red.coefs_, red.intercepts_))
    print(f"{n:16d} | {pesos:5d} | {red.score(X_tr, y_tr):13.1%} | {red.score(X_te, y_te):12.1%}")

# La red de 32 neuronas entrega una probabilidad por dígito (softmax) para cada imagen nueva
p = red.predict_proba(X_te[:1])[0]
top = np.argsort(p)[::-1][:2]
print(f"\nPrimera imagen nueva (es un {y_te[0]}): {top[0]} con {p[top[0]]:.0%}, {top[1]} con {p[top[1]]:.0%}")
