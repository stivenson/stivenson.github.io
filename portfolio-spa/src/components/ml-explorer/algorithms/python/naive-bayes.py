# Sentimiento de reseñas: Naive Bayes cuenta palabras y multiplica sus evidencias
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

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

vectorizador = CountVectorizer()
X = vectorizador.fit_transform(textos)
nb = MultinomialNB(alpha=1.0).fit(X, y)   # alpha = 1: suavizado de Laplace
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
