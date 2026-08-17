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

El capítulo 3 de [*Deep Learning*](https://www.deeplearningbook.org/contents/prob.html) presenta la probabilidad como un marco para representar incertidumbre y distingue entre variables aleatorias, distribuciones discretas y densidades continuas. Aquí usaremos esa base y la conectaremos con los ejercicios de cálculo que hemos venido resolviendo.

## **🗺️ OVA 0: anatomía de la notación**

Antes de entrar en las definiciones, conviene ver el mapa completo. Toda la ruta de este artículo cabe en una sola expresión:

$$
P(a\leq X\leq b)=\int_a^b p(x)\,dx
$$

Pasa el cursor por cada símbolo —el signo integral, $p(x)$, $dx$, los límites $a$ y $b$— y observa qué parte de la gráfica se ilumina. Mueve los límites para ver cómo cambia el área.

<iframe src="/ovas/plano-cartesiano-integral.html" title="OVA: anatomía de la integral en el plano cartesiano" loading="lazy" style="width:100%;min-height:820px;border:0;"></iframe>

Cada símbolo tiene un significado geométrico concreto: $p(x)$ es la altura, $dx$ es una base microscópica, el signo $\int$ suma infinitos rectángulos de área $p(x)\,dx$, y los límites $a$ y $b$ marcan dónde empieza y termina esa suma. El resto del artículo desarrolla estas piezas una por una.

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

Si $X$ puede tomar cualquier valor dentro de un intervalo, usamos una función de densidad:

$$
f_X(x)
$$

Aquí aparece una diferencia fundamental:

$$
f_X(x)
$$

no es directamente la probabilidad de que $X=x$. Para una variable continua, la probabilidad de un único punto es normalmente cero. La probabilidad se obtiene acumulando área:

$$
P(a\leq X\leq b)=\int_a^b f_X(x)\,dx
$$

## **📐 OVA 1: la densidad normal y el área que sí representa probabilidad**

Explora la media, la desviación estándar y los límites del intervalo. La zona sombreada es la probabilidad $P(a\leq X\leq b)$.

<iframe src="/ovas/normal-probability.html" title="OVA: distribución normal y probabilidad como área" loading="lazy" style="width:100%;min-height:520px;border:0;"></iframe>

La densidad normal tiene la forma:

$$
f(x)=\frac{1}{\sigma\sqrt{2\pi}}
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
P(a\leq X\leq b)
=
\Phi\left(\frac{b-\mu}{\sigma}\right)
-
\Phi\left(\frac{a-\mu}{\sigma}\right)
$$

La calculadora o Python pueden devolver el valor numérico, pero el significado sigue siendo geométrico: **una diferencia de áreas bajo la curva**.

## **🧩 Antiderivada e integral indefinida**

Para entender por qué la integral acumula área conviene recordar su relación con la derivada.

Una función $F(x)$ es una antiderivada de $f(x)$ si:

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

En cambio, una integral definida produce un número:

$$
\int_a^b f(x)\,dx=F(b)-F(a)
$$

Aquí la constante desaparece:

$$
[F(b)+C]-[F(a)+C]=F(b)-F(a)
$$

## **📊 OVA 2: la integral como acumulación**

Modifica el coeficiente, el exponente y el límite superior. Observa simultáneamente la curva, el área sombreada, la antiderivada y el valor acumulado.

<iframe src="/ovas/integral-area.html" title="OVA: integral como área y antiderivada" loading="lazy" style="width:100%;min-height:520px;border:0;"></iframe>

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

El caso $n=-1$ es especial:

$$
\int\frac{1}{x}\,dx=\ln|x|+C
$$

La lección práctica es sencilla: cuando la variable aparece en el denominador, muchas veces podemos reescribirla como potencia negativa:

$$
\frac{3}{x^2}=3x^{-2}
$$

Pero si hay una suma en el denominador, no existe una regla general que permita “separar” el cociente. Primero hay que simplificar, hacer una sustitución, dividir polinomios o utilizar otra técnica.

## **🔔 De la densidad a la probabilidad**

Una densidad debe cumplir tres condiciones:

1. $f(x)\geq 0$;
2. su dominio contiene los valores posibles de $X$;
3. el área total es uno:

$$
\int_{-\infty}^{\infty}f(x)\,dx=1
$$

La tercera condición es la normalización. Si el área total fuera mayor que uno, estaríamos asignando más del cien por ciento de probabilidad.

Esto también explica por qué una densidad puede tener valores mayores que uno. La altura de $f(x)$ no tiene que ser una probabilidad; lo que debe quedar entre cero y uno es el área acumulada de un evento.

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

La operación implementada es exactamente:

$$
\Phi\left(\frac{b-\mu}{\sigma}\right)
-
\Phi\left(\frac{a-\mu}{\sigma}\right)
$$

La biblioteca evita hacer manualmente la aproximación numérica, pero no reemplaza la interpretación matemática.

## **🧠 Una conexión adicional: ecuaciones diferenciales separables**

En nuestros ejercicios apareció la ecuación:

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

## **📈 OVA 3: una familia de soluciones**

Mueve $C$ y observa cómo cambia la curva. El punto $(1,8)$ queda fijo como referencia; la solución que pasa exactamente por él usa $C=15$ en la forma normalizada.

<iframe src="/ovas/ode-separable.html" title="OVA: solución de una ecuación diferencial separable" loading="lazy" style="width:100%;min-height:520px;border:0;"></iframe>

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
\text{densidad}
\xrightarrow{\text{integrar}}
\text{probabilidad acumulada}
}
$$

La antiderivada ayuda a calcular integrales; la integral convierte una densidad en probabilidad; la normal estándar permite comparar valores con una escala común; y las ecuaciones diferenciales muestran cómo una tasa de cambio puede definir toda una familia de soluciones.

La probabilidad no es solo una tabla de porcentajes. Es una forma de razonar sobre incertidumbre usando funciones, áreas, integrales y modelos.

## **🔗 Referencias**

- [Goodfellow, Bengio y Courville — *Deep Learning*, capítulo 3: Probability and Information Theory](https://www.deeplearningbook.org/contents/prob.html)
- [SciPy — scipy.stats.norm](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html)
