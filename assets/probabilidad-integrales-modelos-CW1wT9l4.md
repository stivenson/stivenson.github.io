---
title: "Probabilidad e integrales: del área bajo una curva a la incertidumbre"
date: "2026-08-17"
slug: "probabilidad-integrales-modelos"
description: "Una ruta visual para entender variables aleatorias, funciones de densidad, distribución normal, integrales y ecuaciones diferenciales separables."
tags: ["Matemáticas", "Probabilidad", "Cálculo", "IA"]
---

# **Probabilidad e integrales: del área bajo una curva a la incertidumbre**

## **📌 Introducción: la incertidumbre también se puede calcular**

Cuando hablamos de probabilidad no estamos abandonando las matemáticas exactas. Estamos construyendo un lenguaje para representar situaciones en las que no conocemos con certeza el resultado.

En inteligencia artificial, esta forma de pensar aparece constantemente: un modelo clasifica una imagen, estima un riesgo, predice una demanda o asigna una probabilidad a varias hipótesis. La pregunta central no es solamente *qué puede ocurrir*, sino también:

> **¿Qué tan plausible es cada resultado y cómo acumulamos esas posibilidades?**

La respuesta conecta tres ideas:

1. una **variable aleatoria**;
2. una **función de distribución o de densidad**;
3. una **integral**, que permite acumular probabilidad sobre un intervalo.

El capítulo 3 de [*Deep Learning*](https://www.deeplearningbook.org/contents/prob.html) presenta la probabilidad como un marco para representar incertidumbre y distingue entre variables aleatorias, distribuciones discretas y densidades continuas. Partiremos de esa base y la conectaremos con las herramientas de cálculo que hacen falta para usarla: antiderivadas, integrales definidas y ecuaciones diferenciales separables.

## **🗺️ OVA 1: anatomía de la notación**

Antes de entrar en las definiciones, conviene ver el mapa completo. Toda la ruta de este artículo cabe en una sola expresión:

$$
\textcolor{#10b981}{P(\textcolor{#f43f5e}{a}\leq X\leq \textcolor{#06b6d4}{b})}
=
\int_{\textcolor{#f43f5e}{a}}^{\textcolor{#06b6d4}{b}}
\textcolor{#a855f7}{f(x)}\,\textcolor{#f59e0b}{dx}
$$

Pasa el cursor por cada símbolo —el signo integral, $\textcolor{#a855f7}{f(x)}$, $\textcolor{#f59e0b}{dx}$, los límites $\textcolor{#f43f5e}{a}$ y $\textcolor{#06b6d4}{b}$— y observa qué parte de la gráfica se ilumina. Mueve los límites para ver cómo cambia el área.

<iframe src="/ovas/plano-cartesiano-integral.html" title="OVA: anatomía de la integral en el plano cartesiano" loading="lazy" style="width:100%;border:0;"></iframe>

Cada símbolo tiene un significado geométrico concreto, y **cada uno conserva su color en todas las visualizaciones del artículo**:

| Símbolo | Color | Qué es en la gráfica |
|---|---|---|
| $\textcolor{#a855f7}{f(x)}$ | violeta | la **curva**: la altura en cada punto |
| $\textcolor{#f59e0b}{dx}$ | ámbar | la **base microscópica** de cada rectángulo |
| $\int$ | — | la **suma** de infinitos rectángulos $\textcolor{#a855f7}{f(x)}\,\textcolor{#f59e0b}{dx}$ |
| $\textcolor{#f43f5e}{a}$ | rosa | la **pared izquierda**: dónde empieza |
| $\textcolor{#06b6d4}{b}$ | cian | la **pared derecha**: dónde termina |
| $\textcolor{#10b981}{P}$ | esmeralda | el **área sombreada**: el resultado |

Altura por base, sumado desde una pared hasta la otra, da el área. Y ese área **es** la probabilidad.

> **Sobre la notación:** la visualización escribe la densidad como $\textcolor{#a855f7}{p(x)}$ y en el resto del artículo la llamaremos $\textcolor{#a855f7}{f(x)}$. Son el mismo objeto —fíjate en que comparten color—; la letra cambia según el texto que consultes.

## **🎲 Variable aleatoria no significa “variable misteriosa”**

Una variable aleatoria es una variable cuyo valor depende del resultado de un fenómeno incierto.

Por ejemplo, si $X$ representa el tiempo que tarda una solicitud en responder, $X$ puede tomar distintos valores según la carga del sistema, la red y otros factores.

La variable aleatoria no es todavía una probabilidad. Es el objeto que puede tomar valores. Para describir qué tan posibles son esos valores necesitamos una distribución.

### **Variable discreta**

Si $X$ solo puede tomar valores separados, usamos una función de masa de probabilidad:

$$
P(X=x)
$$

Ejemplo: el número de caras al lanzar tres monedas.

### **Variable continua**

Si $X$ puede tomar cualquier valor dentro de un intervalo, usamos una **función de densidad**, que escribiremos $f(x)$ —o $f_X(x)$ cuando haga falta recordar de qué variable estamos hablando.

Aquí aparece la diferencia fundamental: **$\textcolor{#a855f7}{f(x)}$ no es la probabilidad de que $X=x$**. La curva violeta es una *altura*, no una probabilidad. Para una variable continua, la probabilidad de un único punto es normalmente cero. La probabilidad —lo verde— se obtiene acumulando área:

$$
\textcolor{#10b981}{P(\textcolor{#f43f5e}{a}\leq X\leq \textcolor{#06b6d4}{b})}
=
\int_{\textcolor{#f43f5e}{a}}^{\textcolor{#06b6d4}{b}}
\textcolor{#a855f7}{f(x)}\,\textcolor{#f59e0b}{dx}
$$

### **Qué hace que una función sea una densidad**

No cualquier función sirve. Una densidad debe cumplir tres condiciones:

1. $\textcolor{#a855f7}{f(x)}\geq 0$;
2. su dominio contiene los valores posibles de $X$;
3. el área total es uno:

$$
\int_{-\infty}^{\infty}\textcolor{#a855f7}{f(x)}\,\textcolor{#f59e0b}{dx}=\textcolor{#10b981}{1}
$$

La tercera condición es la **normalización**. Si el área total fuera mayor que uno, estaríamos asignando más del cien por ciento de probabilidad.

Esto también explica por qué una densidad puede tener valores mayores que uno: **la altura violeta y el área verde son cosas distintas**. $\textcolor{#a855f7}{f(x)}$ puede valer 3 en un punto sin que nada se rompa; lo que nunca puede pasar de uno es $\textcolor{#10b981}{\text{el área}}$ acumulada de un evento.

## **🧩 Antiderivada e integral indefinida**

Toda la sección anterior descansa sobre una integral, así que conviene detenerse en cómo funciona antes de aplicarla a un caso concreto.

> En esta sección y la siguiente, $f(x)$ es **una función cualquiera**, no necesariamente una densidad: las reglas del cálculo valen para todas por igual.

Para entender por qué la integral acumula área conviene recordar su relación con la derivada. Una función $F(x)$ es una antiderivada de $f(x)$ si:

$$
F'(x)=f(x)
$$

La integral indefinida representa la familia completa de antiderivadas:

$$
\int f(x)\,dx=F(x)+C
$$

Por ejemplo:

$$
\int 2x\,dx=x^2+C
$$

porque:

$$
\frac{d}{dx}(x^2+C)=2x
$$

La constante $C$ aparece porque todas las funciones $x^2+C$ tienen la misma derivada.

En cambio, una integral definida produce un número: exactamente el área verde entre las dos paredes.

$$
\int_{\textcolor{#f43f5e}{a}}^{\textcolor{#06b6d4}{b}} f(x)\,\textcolor{#f59e0b}{dx}
=
\textcolor{#10b981}{F(\textcolor{#06b6d4}{b})-F(\textcolor{#f43f5e}{a})}
$$

Aquí la constante desaparece:

$$
[F(b)+C]-[F(a)+C]=F(b)-F(a)
$$

Por eso la constante importa al describir una familia de funciones, pero no al calcular un área concreta.

## **📊 OVA 2: la integral como acumulación**

Modifica el coeficiente, el exponente y el límite superior. Observa simultáneamente la curva, el área sombreada, la antiderivada y el valor acumulado.

<iframe src="/ovas/integral-area.html" title="OVA: integral como área y antiderivada" loading="lazy" style="width:100%;border:0;"></iframe>

Para una función potencia:

$$
f(x)=ax^n
$$

la regla es:

$$
\int ax^n\,dx
=
a\frac{x^{n+1}}{n+1}+C
\qquad n\neq -1
$$

El caso $n=-1$ es especial, porque la regla anterior dividiría entre cero:

$$
\int\frac{1}{x}\,dx=\ln|x|+C
$$

Con esto ya tenemos las dos piezas: sabemos qué significa acumular área y sabemos calcularla. Volvamos a la probabilidad.

## **📐 OVA 3: la densidad normal y el área que sí representa probabilidad**

Explora la media, la desviación estándar y los límites del intervalo. La zona sombreada es la probabilidad $P(a\leq X\leq b)$.

<iframe src="/ovas/normal-probability.html" title="OVA: distribución normal y probabilidad como área" loading="lazy" style="width:100%;border:0;"></iframe>

La curva violeta que ves arriba es esta función —la densidad normal:

$$
\textcolor{#a855f7}{f(x)}=\frac{1}{\sigma\sqrt{2\pi}}
\exp\left(-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2\right)
$$

Sus parámetros son:

- $\mu$: media o centro de la distribución;
- $\sigma$: desviación estándar, que controla la dispersión.

Cuando $\mu=0$ y $\sigma=1$, hablamos de la **normal estándar**:

$$
Z\sim N(0,1)
$$

Para convertir un valor $x$ a la escala estándar usamos el puntaje $z$:

$$
z=\frac{x-\mu}{\sigma}
$$

La función $\Phi(z)$ representa el área acumulada a la izquierda de $z$:

$$
\Phi(z)=P(Z\leq z)
$$

Por eso, para una variable normal:

$$
\textcolor{#10b981}{P(\textcolor{#f43f5e}{a}\leq X\leq \textcolor{#06b6d4}{b})}
=
\Phi\left(\frac{\textcolor{#06b6d4}{b}-\mu}{\sigma}\right)
-
\Phi\left(\frac{\textcolor{#f43f5e}{a}-\mu}{\sigma}\right)
$$

La calculadora o Python pueden devolver el valor numérico, pero el significado sigue siendo geométrico: **una diferencia de áreas bajo la curva**. Es la misma resta $F(\textcolor{#06b6d4}{b})-F(\textcolor{#f43f5e}{a})$ de la sección anterior, con $\Phi$ haciendo de antiderivada.

## **🧮 Python: calcular una probabilidad normal**

Una forma práctica de calcular $P(a\leq X\leq b)$ es usar la función de distribución acumulada de una normal:

~~~~python
from scipy.stats import norm

mu = 70
sigma = 10
a = 60
b = 85

probabilidad = norm.cdf(b, loc=mu, scale=sigma)
probabilidad -= norm.cdf(a, loc=mu, scale=sigma)

print(probabilidad)
~~~~

Las variables `a` y `b` del código son las mismas paredes $\textcolor{#f43f5e}{a}$ y $\textcolor{#06b6d4}{b}$ que mueves con los deslizadores, y `norm.cdf` es $\Phi$. La operación implementada es exactamente:

$$
\textcolor{#10b981}{
\Phi\left(\frac{\textcolor{#06b6d4}{b}-\mu}{\sigma}\right)
-
\Phi\left(\frac{\textcolor{#f43f5e}{a}-\mu}{\sigma}\right)}
$$

Cuatro formas de decir lo mismo: el **área verde** de la gráfica, la **integral** $\int_{\textcolor{#f43f5e}{a}}^{\textcolor{#06b6d4}{b}}\textcolor{#a855f7}{f(x)}\,\textcolor{#f59e0b}{dx}$, la **diferencia de acumuladas** de arriba, y las tres líneas de Python. La biblioteca evita hacer manualmente la aproximación numérica, pero no reemplaza la interpretación matemática.

## **🧠 Una conexión adicional: ecuaciones diferenciales separables**

Hasta aquí la integral ha servido para **acumular**: convertir una densidad en probabilidad. Pero la misma operación resuelve un problema distinto: **recuperar una función a partir de su tasa de cambio**. Ese es el terreno de las ecuaciones diferenciales, y vale la pena verlo porque ahí la constante de integración deja de ser un detalle y pasa a decidir cuál de todas las soluciones posibles es la nuestra.

Tomemos una ecuación diferencial separable como esta:

$$
\frac{dy}{dx}=\sqrt[3]{\frac{x}{y}}
=\frac{x^{1/3}}{y^{1/3}}
$$

Separando variables:

$$
y^{1/3}\,dy=x^{1/3}\,dx
$$

Integramos:

$$
\frac34y^{4/3}=\frac34x^{4/3}+C
$$

Multiplicando por $4$ y luego dividiendo entre $3$:

$$
y^{4/3}=x^{4/3}+C
$$

Finalmente:

$$
y=\left(x^{4/3}+C\right)^{3/4}
$$

Si imponemos $y(1)=8$:

$$
8=\left(1+C\right)^{3/4}
$$

$$
8^{4/3}=1+C
$$

$$
16=1+C
$$

$$
C=15
$$

Observa que aquí usamos una constante normalizada. En la forma anterior, sin normalizar:

$$
\frac34y^{4/3}=\frac34x^{4/3}+\frac{45}{4}
$$

Las constantes $15$ y $45/4$ corresponden a dos formas equivalentes de escribir la misma solución.

## **📈 OVA 4: una familia de soluciones**

Mueve $C$ y observa cómo cambia la curva. El punto $(1,8)$ queda fijo como referencia; la solución que pasa exactamente por él usa $C=15$ en la forma normalizada.

<iframe src="/ovas/ode-separable.html" title="OVA: solución de una ecuación diferencial separable" loading="lazy" style="width:100%;border:0;"></iframe>

La derivada de la solución normalizada verifica la ecuación:

$$
y(x)=\left(x^{4/3}+15\right)^{3/4}
$$

$$
y'(x)
=
\frac{x^{1/3}}{\left(x^{4/3}+15\right)^{1/4}}
=
\frac{x^{1/3}}{y^{1/3}}
$$

La ecuación diferencial no solo produce una fórmula: produce una familia de curvas. La condición inicial selecciona una curva concreta.

## **⚠️ Errores frecuentes**

### Confundir variable aleatoria con distribución

La variable aleatoria es el objeto que puede tomar valores. La distribución indica cómo se reparte la probabilidad sobre esos valores.

### Confundir densidad con probabilidad

$$
f(x)\neq P(X=x)
$$

En variables continuas, usamos:

$$
P(a\leq X\leq b)=\int_a^b f(x)\,dx
$$

### Distribuir una potencia sobre una suma

En general:

$$
(a+b)^r\neq a^r+b^r
$$

Por eso:

$$
\left(x^{4/3}+C\right)^{3/4}
$$

debe conservarse con sus paréntesis.

### Perder la constante de integración

En una integral indefinida debe aparecer $+C$. En una integral definida, la constante se cancela al evaluar los límites.

## **✅ Conclusión**

La conexión central es esta:

$$
\boxed{
\textcolor{#a855f7}{\text{densidad}}
\xrightarrow{\textcolor{#f59e0b}{\text{integrar}}}
\textcolor{#10b981}{\text{probabilidad acumulada}}
}
$$

Violeta la altura, ámbar la operación que la acumula, verde el resultado. Los mismos tres colores que llevas viendo desde la primera gráfica.

La antiderivada ayuda a calcular integrales; la integral convierte una densidad en probabilidad; la normal estándar permite comparar valores con una escala común; y las ecuaciones diferenciales muestran cómo una tasa de cambio puede definir toda una familia de soluciones.

La probabilidad no es solo una tabla de porcentajes. Es una forma de razonar sobre incertidumbre usando funciones, áreas, integrales y modelos.

## **🔗 Referencias**

- [Goodfellow, Bengio y Courville — *Deep Learning*, capítulo 3: Probability and Information Theory](https://www.deeplearningbook.org/contents/prob.html)
- [SciPy — scipy.stats.norm](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html)
