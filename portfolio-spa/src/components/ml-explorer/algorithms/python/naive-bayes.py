# Sentimiento de reseñas: Naive Bayes cuenta palabras y multiplica sus evidencias
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Ajustes: seleccionarlos con validación en un proyecto real.
ALPHA = 1.0                  # Suavizado: un conteo cero no elimina una clase.
CLASS_PRIOR = None           # None: estimar; [0.8, 0.2]: negativa, positiva.
NGRAM_RANGE = (1, 1)         # CountVectorizer: (1, 2) añade pares de palabras.

resenas = [
    ("excelente producto llegó rápido y funciona perfecto", 1),
    ("muy buena calidad lo recomiendo", 1),
    ("me encantó excelente atención", 1),
    ("funciona perfecto buena compra", 1),
    ("rápido y buena calidad recomendado", 1),
    ("excelente precio muy contento", 1),
    ("buena batería y pantalla excelente", 1),
    ("lo recomiendo a todos me encantó", 1),
    ("pésimo producto llegó roto", 0),
    ("muy mala calidad no lo recomiendo", 0),
    ("llegó tarde y no funciona", 0),
    ("mala atención pésimo servicio", 0),
    ("se dañó en una semana mala compra", 0),
    ("no funciona devolví el producto", 0),
    ("la batería dura poco mala calidad", 0),
    ("pésimo no lo compren", 0),
]
textos = [t for t, _ in resenas]
y = np.array([s for _, s in resenas])

vectorizador = CountVectorizer(ngram_range=NGRAM_RANGE)
X = vectorizador.fit_transform(textos)
nb = MultinomialNB(alpha=ALPHA, class_prior=CLASS_PRIOR).fit(X, y)   # alpha = 1: suavizado de Laplace
print(f"{len(textos)} reseñas, {X.shape[1]} palabras distintas")
print(f"Prior: P(positiva) = {np.exp(nb.class_log_prior_[1]):.2f}")

nuevas = ["excelente calidad llegó rápido", "no funciona mala compra", "llegó la batería nueva"]
print("\nReseña nueva                     P(positiva)")
for texto, p in zip(nuevas, nb.predict_proba(vectorizador.transform(nuevas))[:, 1]):
    print(f"  {texto:<31} {p:.0%}")

palabras = vectorizador.get_feature_names_out()
razon = nb.feature_log_prob_[1] - nb.feature_log_prob_[0]   # log P(w|pos) - log P(w|neg)
print("\nPalabras que más empujan a positiva:", ", ".join(palabras[np.argsort(-razon, kind="stable")[:3]]))
print("Palabras que más empujan a negativa:", ", ".join(palabras[np.argsort(razon, kind="stable")[:3]]))
for w in ["llegó", "batería", "la"]:
    print(f"«{w}» multiplica los odds de positiva por {np.exp(razon[vectorizador.vocabulary_[w]]):.2f}")
print("«nueva» no estaba en el entrenamiento: se ignora")

# Cambia una sola opción cada vez, manteniendo los mismos conteos de entrenamiento.
frase = "excelente calidad llegó rápido"
x_frase = vectorizador.transform([frase])
print("\nEfecto de alpha (prior estimado):")
for alpha in [0.1, 1.0, 5.0]:
    modelo = MultinomialNB(alpha=alpha).fit(X, y)
    print(f"  alpha={alpha:.1f}: P(positiva) = {modelo.predict_proba(x_frase)[0, 1]:.1%}")
print("Efecto del prior (alpha=1.0):")
for p_positiva in [0.2, 0.5, 0.8]:
    modelo = MultinomialNB(alpha=1.0, class_prior=[1 - p_positiva, p_positiva]).fit(X, y)
    print(f"  prior positivo={p_positiva:.0%}: P(positiva) = {modelo.predict_proba(x_frase)[0, 1]:.1%}")
print("Estos resultados ilustran probabilidades, no miden aciertos con datos independientes.")
