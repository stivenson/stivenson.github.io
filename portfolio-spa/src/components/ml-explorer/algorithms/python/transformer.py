# Self-attention a mano: cómo «banco» mira a las otras palabras de la frase
import numpy as np

# Embeddings de juguete con 4 números: [función, cosa, dinero, naturaleza]
emb = {
    "el": [1.0, 0.0, 0.0, 0.0],
    "banco": [0.0, 1.0, 1.0, 1.0],  # ambiguo: dinero y naturaleza por igual
    "del": [1.0, 0.0, 0.0, 0.0],
    "río": [0.0, 1.0, 0.0, 2.0],
    "cobra": [0.0, 0.5, 1.5, 0.0],
    "interés": [0.0, 1.0, 2.0, 0.0],
}


def softmax(s):
    e = np.exp(s - s.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)


def posicion(n, d=4):
    """Codificación posicional sinusoidal (la del artículo original del Transformer)."""
    pos = np.arange(n)[:, None]
    i = np.arange(d)[None, :]
    angulo = pos / 10000 ** (2 * (i // 2) / d)
    return np.where(i % 2 == 0, np.sin(angulo), np.cos(angulo))


def atencion(palabras, con_posicion=False, causal=False):
    X = np.array([emb[p] for p in palabras])
    if con_posicion:
        X = X + posicion(len(palabras))
    Q, K, V = X, X, X  # en un modelo real: X @ W_Q, X @ W_K, X @ W_V, con pesos aprendidos
    puntajes = Q @ K.T / np.sqrt(X.shape[1])
    if causal:  # estilo GPT: cada palabra solo ve las anteriores
        puntajes = np.where(np.tril(np.ones_like(puntajes)) == 1, puntajes, -np.inf)
    A = softmax(puntajes)
    return A, A @ V


def mostrar(palabras, A):
    print("         " + "".join(f"{p:>9}" for p in palabras))
    for p, fila in zip(palabras, A):
        print(f"{p:>9}" + "".join(f"{a:9.2f}" for a in fila))


for frase in (["el", "banco", "del", "río"], ["el", "banco", "cobra", "interés"]):
    A, salida = atencion(frase)
    print(f"«{' '.join(frase)}»: cuánto atiende cada palabra (fila) a cada otra (columna)")
    mostrar(frase, A)
    b = salida[1]
    print(f"«banco» después de la atención: dinero {b[2]:.2f}, naturaleza {b[3]:.2f}\n")

frase = ["el", "banco", "del", "río"]
A, _ = atencion(frase, causal=True)
print("Con máscara causal (estilo GPT): «banco» aún no ve «río»")
mostrar(frase, A)

al_reves = frase[::-1]
for con in (False, True):
    b1 = atencion(frase, con_posicion=con)[1][1]
    b2 = atencion(al_reves, con_posicion=con)[1][al_reves.index("banco")]
    nombre = "con" if con else "sin"
    print(f"\n{nombre} codificación posicional: «banco» cambia {np.abs(b1 - b2).max():.2f} al invertir la frase")
