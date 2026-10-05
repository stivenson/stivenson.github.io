# Una RNN mínima: ¿cuánto influye la primera medición en la salida final?
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=50)  # 50 mediciones seguidas (por ejemplo, consumo de energía hora a hora)


def rnn(x, w, u):
    """h_t = tanh(w·h_(t−1) + u·x_t): la memoria h se actualiza con cada medición."""
    h = np.zeros(len(x) + 1)
    for t, xt in enumerate(x, start=1):
        h[t] = np.tanh(w * h[t - 1] + u * xt)
    return h


def influencia_del_primero(x, w, u):
    """∂h_T/∂x_1 por la regla de la cadena hacia atrás (retropropagación en el tiempo)."""
    h = rnn(x, w, u)
    grad = u * (1 - h[1] ** 2)  # cuánto mueve x_1 a h_1
    for t in range(2, len(x) + 1):
        grad *= w * (1 - h[t] ** 2)  # cada paso multiplica por w·tanh'(…), que aquí (w ≤ 1) es menor que 1;
        # con w > 1 tanh se satura y el factor sigue siendo menor que 1: no explota
    return grad


u = 0.5
print("pasos T |  w = 0.5 |  w = 0.9 |  w = 1.0")
for T in (1, 5, 10, 20, 50):
    fila = [influencia_del_primero(x[:T], w, u) for w in (0.5, 0.9, 1.0)]
    print(f"{T:7d} | " + " | ".join(f"{g:8.1e}" for g in fila))

# Comprobación sin regla de la cadena: mover x_1 un poquito y ver cuánto se mueve h_T
T, w, eps = 10, 0.9, 1e-6
x2 = x[:T].copy()
x2[0] += eps
numerico = (rnn(x2, w, u)[-1] - rnn(x[:T], w, u)[-1]) / eps
print(f"\nComprobación con T = {T}, w = {w}: regla de la cadena {influencia_del_primero(x[:T], w, u):.4f}, numérica {numerico:.4f}")
