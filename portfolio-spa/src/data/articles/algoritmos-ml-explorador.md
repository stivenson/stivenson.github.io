---
title: "Algoritmos de Machine Learning: Explorador Interactivo"
date: "2026-10-03"
slug: "algoritmos-ml-explorador"
description: "Los 17 algoritmos del cheatsheet clásico de machine learning, explicados columna por columna —tipo, caso de uso, fórmula, supuestos, pros, contras y ejemplo real— con simuladores y Python que corre en tu navegador."
tags: ["Machine Learning", "Python", "Algoritmos", "OVA", "Ciencia de datos"]
---

> **En corto:** no existe «el mejor algoritmo». Cada uno funciona bien bajo ciertas condiciones y falla en otras. Este explorador recorre los 17 algoritmos del cheatsheet clásico de machine learning y responde lo mismo para cada uno: qué problema resuelve, cómo funciona, qué supone, cuándo brilla, cuándo no usarlo y un ejemplo real que puedes ejecutar.

Está escrito para estudiantes de Datos y Sistemas y para profesionales de cualquier ingeniería que necesiten decidir si un modelo sirve para su problema. No hace falta saber machine learning: cada término técnico tiene una ficha 💡, y la matemática está plegada en «Para profundizar».

## Cómo usar el explorador

- **Menú izquierdo:** un algoritmo por fila del cheatsheet. Los marcados «pronto» llegan en las próximas entregas.
- **Pestañas:** las 8 columnas del cheatsheet. Al cambiar de algoritmo la pestaña se mantiene: así puedes comparar, por ejemplo, los *Contras* de todos.
- **Fórmula / lógica:** un ejemplo con números, la fórmula y un simulador para tocar.
- **Ejemplo real:** un ejercicio breve de Python que corre en tu navegador y puedes editar. También está en un [notebook de Colab](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb).
- Cada combinación tiene su propio enlace: copia la URL para compartir, por ejemplo, «KNN › Contras».

## ¿Qué algoritmo necesito?

Responde de arriba abajo:

1. **¿Tus datos traen la respuesta que quieres predecir?** (el precio, «spam / no spam», «paga / no paga»)
   - **Sí → aprendizaje supervisado.** Sigue con la pregunta 2.
   - **No → aprendizaje no supervisado.** ¿Buscas grupos? K-Means, Hierarchical Clustering o DBSCAN *(próximamente)*. ¿Quieres resumir muchas columnas en pocas? PCA *(próximamente)*.
2. **¿Predices un número o una categoría?**
   - **Un número** (precio, consumo, tiempo): empieza por [Linear Regression](#/articles/algoritmos-ml-explorador?alg=linear-regression&tab=type).
   - **Una categoría** (sí/no, tipo A/B/C): empieza por [Logistic Regression](#/articles/algoritmos-ml-explorador?alg=logistic-regression&tab=type).
3. **¿Tienes que explicar cada decisión a otra persona?**
   - **Sí:** un [Decision Tree](#/articles/algoritmos-ml-explorador?alg=decision-tree&tab=type) poco profundo, o los modelos lineales de la pregunta 2.
   - **No, lo que importa es acertar:** Random Forest o Gradient Boosting *(próximamente)*.
4. **¿Pocos datos, y la idea de «se parece a…» es natural en tu problema?** Prueba [KNN](#/articles/algoritmos-ml-explorador?alg=knn&tab=type).
5. **¿Imágenes, texto, audio o series largas?** Redes neuronales: CNN, RNN o Transformer *(próximamente)*.

> **Regla práctica:** empieza por el modelo más simple que pueda funcionar y úsalo como línea base. Pasa a uno más complejo solo si mejora claramente con datos que el modelo no vio.

## El explorador

<ml-explorer>
</ml-explorer>

## Cómo seguir

- Ejecuta todos los ejercicios juntos en el [notebook de Colab](https://colab.research.google.com/github/stivenson/stivenson.github.io/blob/main/notebooks/algoritmos-ml.ipynb). No necesita GPU.
- Cambia los datos de un ejercicio por los de tu trabajo: todos usan solo numpy, scikit-learn y matplotlib.
- Antes de elegir un algoritmo para un proyecto real, repasa esta lista:

- ☐ ¿Separé datos de entrenamiento y de prueba?
- ☐ ¿Tengo una línea base simple con la cual comparar?
- ☐ ¿Revisé los supuestos del algoritmo (pestaña *Supuestos*)?
- ☐ ¿Sé qué error es más caro en mi problema: la falsa alarma o el caso que se escapa?
- ☐ ¿Puedo explicar la decisión del modelo si me lo piden?
