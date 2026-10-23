# Autoencoder lineal: entrenamiento, selección, calibración y prueba separados.
import numpy as np

rng = np.random.default_rng(7)
mezcla = rng.normal(size=(2, 6))
# Normales: dos factores ocultos más ruido; anomalías: no siguen ese patrón.
N = rng.normal(size=(1000, 2)) @ mezcla + 0.2 * rng.normal(size=(1000, 6))
F = rng.normal(size=(30, 6)) * 1.5
# El escalado se aprende SOLO en las 600 normales de entrenamiento.
media, desv = N[:600].mean(axis=0), N[:600].std(axis=0)
N, F = (N - media) / desv, (F - media) / desv
entreno, val_normal, calibracion, prueba_normal = np.split(N, [600, 800, 900])
val_fraude, prueba_fraude = np.split(F, [20])
print("Normales: 600 entrenamiento / 200 validación / 100 calibración / 100 prueba")
print("Fraudes simulados: 20 validación / 10 prueba; ninguno entrena la red")


def entrenar(X, k, pasos=6000, tasa=0.05, l2=0.0):
    """k, pasos, tasa y l2 son nombres de este ejemplo, no una API universal.

    Descenso de gradiente de 1/(2n) * suma de errores al cuadrado +
    l2/2 * (||W_cod||² + ||W_dec||²). Una actualización usa todo X:
    aquí un paso coincide con una época. Se informan errores MSE por medida.
    """
    r = np.random.default_rng(0)
    W_cod = 0.1 * r.normal(size=(6, k))
    W_dec = 0.1 * r.normal(size=(k, 6))
    for _ in range(pasos):
        Z = X @ W_cod
        dif = Z @ W_dec - X
        grad_dec = Z.T @ dif / len(X) + l2 * W_dec
        grad_cod = X.T @ (dif @ W_dec.T) / len(X) + l2 * W_cod
        W_dec -= tasa * grad_dec
        W_cod -= tasa * grad_cod
    return W_cod, W_dec


def error(X, W_cod, W_dec):
    return np.mean((X @ W_cod @ W_dec - X) ** 2, axis=1)


# Se compara SOLO k; tasa, pasos y l2 se mantienen fijos y explícitos.
# El percentil 95 se decide de antemano para esta demostración.
percentil = 0.95
candidatos = []
print("\nValidación: cuello k | falsas alarmas / 200 | fraudes señalados / 20")
for k in (1, 2, 4):
    pesos = entrenar(entreno, k, pasos=6000, tasa=0.05, l2=0.0)
    e_n, e_f = error(val_normal, *pesos), error(val_fraude, *pesos)
    provisional = np.quantile(e_n, percentil)
    fp, tp = int(np.sum(e_n > provisional)), int(np.sum(e_f > provisional))
    # Media de sensibilidad y especificidad: usa etiquetas SOLO de validación.
    puntuacion = 0.5 * (tp / len(e_f) + 1 - fp / len(e_n))
    candidatos.append((puntuacion, k, pesos))
    print(f"{k:22d} | {fp:20d} | {tp:21d}")

# En empate conserva el primero (el cuello más pequeño entre estos candidatos).
_, k_elegido, pesos = max(candidatos, key=lambda c: c[0])
# Umbral definitivo: normales de calibración que NO participaron en la selección.
umbral = np.quantile(error(calibracion, *pesos), percentil)
e_n, e_f = error(prueba_normal, *pesos), error(prueba_fraude, *pesos)
print(f"\nElegido con validación: k={k_elegido}; percentil={percentil:.0%}")
print(f"Umbral independiente de calibración: {umbral:.3f}")
print(f"Prueba final: falsas alarmas {np.sum(e_n > umbral)}/{len(e_n)}; fraudes señalados {np.sum(e_f > umbral)}/{len(e_f)}")
print(f"Error medio de prueba: normales {e_n.mean():.3f}; fraudes {e_f.mean():.3f}")
print("Datos sintéticos: una alarma no confirma fraude ni mide rendimiento real.")
