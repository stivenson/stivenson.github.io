# Detector de fraude sin etiquetas: un autoencoder que aprende cómo es una compra normal
import numpy as np

rng = np.random.default_rng(7)
# 6 medidas por compra. En las compras normales salen de 2 factores ocultos
# (cuánto se gasta y cuán lejos de casa se compra), más un poco de ruido.
mezcla = rng.normal(size=(2, 6))
normales = rng.normal(size=(1000, 2)) @ mezcla + 0.2 * rng.normal(size=(1000, 6))
fraudes = rng.normal(size=(10, 6)) * 1.5  # no siguen el patrón de las normales
# Estandarizar con la media y la desviación de las normales (también a los fraudes),
# para que ninguna medida tape a las demás. Así los datos quedan con media 0: no hace falta sesgo.
media, desv = normales.mean(axis=0), normales.std(axis=0)
normales = (normales - media) / desv
fraudes = (fraudes - media) / desv
print(f"{len(normales)} compras normales para entrenar y {len(fraudes)} fraudes que el modelo nunca ve")


def entrenar(X, k, pasos=10000, tasa=0.05):
    """Autoencoder lineal: codifica 6 números en k (cuello de botella) y los decodifica de vuelta."""
    r = np.random.default_rng(0)
    W_cod = 0.1 * r.normal(size=(6, k))
    W_dec = 0.1 * r.normal(size=(k, 6))
    for _ in range(pasos):  # descenso de gradiente sobre el error cuadrático de reconstrucción
        Z = X @ W_cod
        dif = Z @ W_dec - X
        grad_dec = Z.T @ dif / len(X)
        grad_cod = X.T @ (dif @ W_dec.T) / len(X)
        W_dec -= tasa * grad_dec
        W_cod -= tasa * grad_cod
    return W_cod, W_dec


def error(X, W_cod, W_dec):
    return np.mean((X @ W_cod @ W_dec - X) ** 2, axis=1)  # error de reconstrucción de cada compra


print("\ncuello k | error normales | error fraudes | fraudes detectados")
for k in (1, 2, 4):
    W_cod, W_dec = entrenar(normales, k)
    e_norm, e_fraude = error(normales, W_cod, W_dec), error(fraudes, W_cod, W_dec)
    umbral = np.quantile(e_norm, 0.99)  # alarma si el error supera al del 99 % de las normales
    print(f"{k:8d} | {e_norm.mean():14.2f} | {e_fraude.mean():13.2f} | {np.sum(e_fraude > umbral):9d} de {len(fraudes)}")
