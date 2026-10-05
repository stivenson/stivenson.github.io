import{r as p,j as e}from"./react-vendor-DD4lgS3N.js";import{aB as E,aC as S,aD as D,aE as L,aF as M,G as a,T as m}from"./ovaMath-3oMn1UtC.js";import{O as X,a as x}from"./MLExplorer-nZP65GkJ.js";import"./index-DoQsHPHv.js";import"./framer-DBUGI5JL.js";const o=58,b=70,h=28;function G(j,{positional:f,causal:d}){let l=j.map(t=>D[t]);if(f){const t=L(l.length,l[0].length);l=l.map((g,v)=>g.map((y,i)=>y+t[v][i]))}return M(l,d)}function B(){const[j,f]=p.useState(0),[d,l]=p.useState(!1),[t,g]=p.useState(!1),[v,y]=p.useState(!1),[i,k]=p.useState("banco"),u=E[j],r=d?[...u].reverse():[...u],F=d?[...u]:[...u].reverse(),P={positional:t,causal:v},{weights:q,out:T}=G(r,P),c=r.indexOf(i),N=G(F,P).out[F.indexOf(i)],A=Math.max(...T[c].map((n,s)=>Math.abs(n-N[s]))),_=n=>{f(n),E[n].includes(i)||k("banco")},O=()=>{f(0),l(!1),g(!1),y(!1),k("banco")};return e.jsx(X,{title:"Mapa de atención de una frase",hint:"Cada fila es una palabra y dice cuánto atiende a cada palabra de la frase (las filas suman 1). «Banco» es ambiguo: con «río» se inclina hacia naturaleza y con «interés», hacia dinero. Invierte la frase sin codificación posicional: los números solo cambian de lugar y cada palabra sale igual, porque la atención no ve el orden. Con la codificación posicional, sí cambia. La máscara causal (como en GPT) no deja a ninguna palabra mirar las que vienen después. Los embeddings son de juguete, con 4 números escritos a mano.",controls:e.jsxs(e.Fragment,{children:[e.jsxs("div",{role:"group","aria-label":"Frase",children:[e.jsx("span",{children:"Frase: "}),E.map((n,s)=>e.jsx("button",{type:"button","aria-pressed":j===s,onClick:()=>_(s),children:n.join(" ")},n.join(" ")))]}),e.jsxs("div",{role:"group","aria-label":"Opciones",children:[e.jsx("button",{type:"button","aria-pressed":d,onClick:()=>l(n=>!n),children:"Invertir el orden"}),e.jsx("button",{type:"button","aria-pressed":t,onClick:()=>g(n=>!n),children:"Codificación posicional"}),e.jsx("button",{type:"button","aria-pressed":v,onClick:()=>y(n=>!n),children:"Máscara causal (GPT)"})]}),e.jsxs("div",{role:"group","aria-label":"Palabra que explica la lectura",children:[e.jsx("span",{children:"Mirar: "}),u.map(n=>e.jsx("button",{type:"button","aria-pressed":i===n,onClick:()=>k(n),children:n},n))]}),e.jsx("button",{type:"button",onClick:O,children:"Restablecer"})]}),readout:e.jsxs(e.Fragment,{children:[e.jsxs("span",{children:["«",i,"» atiende a:"," ",r.map((n,s)=>e.jsxs("span",{children:[s>0&&" · ",n," ",e.jsx("b",{children:q[c][s].toFixed(2)})]},n))]}),e.jsxs("span",{children:["Después de la atención: ",S[2]," ",e.jsx("b",{children:T[c][2].toFixed(2)})," · ",S[3]," ",e.jsx("b",{children:T[c][3].toFixed(2)})]}),e.jsxs("span",{children:["Si se invierte la frase, «",i,"» cambia ",e.jsx("b",{children:A.toFixed(2)})]})]}),children:e.jsxs("svg",{viewBox:`0 0 ${b+r.length*o+4} ${h+r.length*o+4}`,role:"img","aria-label":`Mapa de atención de «${r.join(" ")}»: una fila por palabra con el peso que da a cada palabra. «${i}» atiende a: ${r.map((n,s)=>`${n} ${q[c][s].toFixed(2)}`).join(", ")}`,children:[r.map((n,s)=>e.jsx("text",{x:b+s*o+o/2,y:h-10,textAnchor:"middle",fontSize:12,fill:x.axis,children:n},`c${n}`)),q.map((n,s)=>e.jsxs("g",{className:"mlx-tf-row",children:[e.jsx("text",{x:b-8,y:h+s*o+o/2+4,textAnchor:"end",fontSize:12,fill:s===c?x.accent:x.axis,fontWeight:s===c?700:400,children:r[s]}),n.map((z,C)=>e.jsxs("g",{children:[e.jsx("rect",{x:b+C*o,y:h+s*o,width:o-2,height:o-2,fill:x.class1,fillOpacity:.06+.9*z,stroke:s===c?x.accent:"none",strokeWidth:2}),e.jsx("text",{x:b+C*o+o/2-1,y:h+s*o+o/2+4,textAnchor:"middle",fontSize:12,fill:"#e8e8f0",children:z.toFixed(2)})]},C))]},r[s]))]})})}const R=`# Self-attention a mano: cómo «banco» mira a las otras palabras de la frase
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
    print(f"«banco» después de la atención: dinero {b[2]:.2f}, naturaleza {b[3]:.2f}\\n")

frase = ["el", "banco", "del", "río"]
A, _ = atencion(frase, causal=True)
print("Con máscara causal (estilo GPT): «banco» aún no ve «río»")
mostrar(frase, A)

al_reves = frase[::-1]
for con in (False, True):
    b1 = atencion(frase, con_posicion=con)[1][1]
    b2 = atencion(al_reves, con_posicion=con)[1][al_reves.index("banco")]
    nombre = "con" if con else "sin"
    print(f"\\n{nombre} codificación posicional: «banco» cambia {np.abs(b1 - b2).max():.2f} al invertir la frase")
`,U=`«el banco del río»: cuánto atiende cada palabra (fila) a cada otra (columna)
                el    banco      del      río
       el     0.31     0.19     0.31     0.19
    banco     0.09     0.41     0.09     0.41
      del     0.31     0.19     0.31     0.19
      río     0.05     0.24     0.05     0.65
«banco» después de la atención: dinero 0.41, naturaleza 1.23

«el banco cobra interés»: cuánto atiende cada palabra (fila) a cada otra (columna)
                el    banco    cobra  interés
       el     0.35     0.22     0.22     0.22
    banco     0.08     0.35     0.21     0.35
    cobra     0.08     0.21     0.27     0.44
  interés     0.04     0.19     0.25     0.52
«banco» después de la atención: dinero 1.38, naturaleza 0.35

Con máscara causal (estilo GPT): «banco» aún no ve «río»
                el    banco      del      río
       el     1.00     0.00     0.00     0.00
    banco     0.18     0.82     0.00     0.00
      del     0.38     0.23     0.38     0.00
      río     0.05     0.24     0.05     0.65

sin codificación posicional: «banco» cambia 0.00 al invertir la frase

con codificación posicional: «banco» cambia 0.30 al invertir la frase
`,Q={slug:"transformer",row:{type:"Supervisado y autosupervisado",bestUse:"Texto y secuencias largas",formula:"Self-attention: cada token pondera a todos los demás",assumptions:"Muchísimos datos y mucho cómputo",pros:"El estándar actual en lenguaje; se entrena en paralelo",cons:"Muy costoso; puede inventar respuestas",whenNot:"Pocos datos, poco cómputo o una tarea simple",realWorld:"ChatGPT, traducción automática"},tabs:{type:{essential:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[e.jsxs("b",{children:[e.jsx(a,{k:"autosupervisado",children:"Autosupervisado"})," y luego ",e.jsx(a,{k:"supervisado",children:"supervisado"}),":"]})," ","primero aprende de enormes cantidades de texto sin etiquetar, adivinando palabras tapadas o la palabra siguiente; después se ajusta con pocos ejemplos etiquetados para una tarea concreta."]}),e.jsxs("p",{children:["Es la ",e.jsx(a,{k:"redNeuronal",children:"red neuronal"})," detrás de los modelos de lenguaje actuales. Su pieza clave es la"," ",e.jsx(a,{k:"atencion",children:"atención"}),": para representar cada palabra, mira todas las demás de la frase a la vez, no una por una como una RNN."]})]}),deepDive:e.jsxs("p",{children:["Hay dos familias principales (",e.jsx(a,{k:"bertGpt",children:"BERT y GPT"}),"). BERT lee la frase entera en ambas direcciones y sirve para clasificar y buscar. GPT lee de izquierda a derecha y aprende a predecir el siguiente"," ",e.jsx(a,{k:"token",children:"token"}),"; con eso genera texto. El ",e.jsx(a,{k:"transformer",children:"Transformer"})," original (2017) tenía las dos partes y se diseñó para traducir."]})},bestUse:{essential:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["Úsalo con ",e.jsx("b",{children:"texto"})," y con secuencias donde lo importante puede estar lejos: contratos, conversaciones, código, proteínas."]}),e.jsxs("ul",{children:[e.jsx("li",{children:"Traducir, resumir o responder preguntas sobre documentos."}),e.jsx("li",{children:"Clasificar correos, reseñas o tickets de soporte por tema y urgencia."}),e.jsx("li",{children:"Buscar por significado y no por palabras exactas, comparando sus vectores."})]}),e.jsxs("p",{className:"mlx-rule",children:["En la práctica no se entrena uno desde cero: se usa un modelo ya entrenado, por"," ",e.jsx(a,{k:"transferencia",children:"ajuste fino"})," o con instrucciones."]})]}),deepDive:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["Entrenar un ",e.jsx(a,{k:"llm",children:"modelo de lenguaje grande"})," cuesta millones de dólares en ",e.jsx(a,{k:"gpu",children:"GPU"}),". Ajustar uno pequeño de tipo ",e.jsx(a,{k:"bertGpt",children:"BERT"})," a una clasificación de textos se hace con unos miles de ejemplos y una sola GPU."]}),e.jsxs("p",{children:["Los ",e.jsx(a,{k:"transformer",children:"Transformers"})," también se usan con imágenes y audio, cortados en trozos que hacen de ",e.jsx(a,{k:"token",children:"tokens"}),"."]})]})},formula:{essential:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[e.jsx("b",{children:"Ejemplo:"})," en «el banco del río», cada palabra tiene un ",e.jsx(a,{k:"embedding",children:"embedding"})," de juguete con 4 números: [función, cosa, dinero, naturaleza]. «Banco» es [0, 1, 1, 1] y «río» es [0, 1, 0, 2]. Su puntaje es el producto punto dividido por √4: (1 + 2) / 2 = 1.5. Con «el», 0."]}),e.jsxs("p",{children:["La ",e.jsx(a,{k:"softmax",children:"softmax"})," convierte los puntajes de «banco» en pesos que suman 1: 0.09 para «el» y «del», 0.41 para «banco» y «río». La nueva versión de «banco» es el promedio de las cuatro palabras con esos pesos: queda con naturaleza 1.23 y dinero 0.41, inclinada hacia naturaleza."]}),e.jsx(m,{block:!0,children:"\\text{Atención}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{Q K^\\top}{\\sqrt{d}}\\right) V"}),e.jsxs("p",{children:[e.jsx(m,{children:"Q"}),", ",e.jsx(m,{children:"K"})," y ",e.jsx(m,{children:"V"})," (consultas, claves y valores) salen de multiplicar los embeddings por tres matrices de pesos aprendidas; ",e.jsx(m,{children:"d"})," es su número de columnas. En el ejemplo y en el simulador, las tres son los embeddings sin cambio."]})]}),deepDive:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["La ",e.jsx(a,{k:"atencion",children:"atención"})," no ve el orden: si se invierte la frase, cada palabra sale igual. Por eso se suma a cada embedding una ",e.jsx(a,{k:"codificacionPosicional",children:"codificación posicional"})," (senos y cosenos según la posición)."]}),e.jsxs("p",{children:["Los modelos tipo ",e.jsx(a,{k:"bertGpt",children:"GPT"})," añaden una ",e.jsx(a,{k:"mascaraCausal",children:"máscara causal"}),": cada token solo ve los anteriores, porque al generar texto el siguiente todavía no existe."]}),e.jsxs("p",{children:["Un bloque real tiene varias cabezas de atención en paralelo, cada una con sus matrices, seguidas de una capa densa. Los modelos apilan decenas de bloques. El costo de la atención crece con el cuadrado del número de"," ",e.jsx(a,{k:"token",children:"tokens"}),": el doble de texto cuesta cuatro veces más."]})]})},assumptions:{essential:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["Supone ",e.jsx("b",{children:"muchísimos datos y mucho cómputo"}),": no trae ideas previas sobre el orden ni sobre la vecindad, así que todo lo aprende de los ejemplos. Con pocos datos, modelos más simples le ganan."]}),e.jsxs("p",{children:["También supone que el texto cabe en su ventana: un número máximo de ",e.jsx(a,{k:"token",children:"tokens"})," que lee de una vez. Lo que queda fuera no existe para el modelo."]})]}),deepDive:e.jsxs("p",{children:["Por eso casi nunca se entrena desde cero: se parte de un modelo preentrenado de forma"," ",e.jsx(a,{k:"autosupervisado",children:"autosupervisada"})," con miles de millones de palabras, que ya captó patrones de gramática y muchas asociaciones, y se ajusta a la tarea."]})},pros:{essential:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("b",{children:"Contexto completo:"})," cada ",e.jsx(a,{k:"token",children:"token"})," mira a todos los demás, estén a 2 o a 2 000 palabras, siempre que quepan en su ventana."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Se entrena en paralelo:"})," a diferencia de la RNN, procesa todos los tokens a la vez, y eso aprovecha bien la ",e.jsx(a,{k:"gpu",children:"GPU"}),"."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Un modelo, muchas tareas:"})," el mismo modelo preentrenado sirve para traducir, resumir, clasificar o responder, con poco ajuste."]})]}),deepDive:e.jsxs("p",{children:["El ",e.jsx(a,{k:"atencion",children:"mapa de atención"})," se puede mirar, como en el simulador, pero con decenas de cabezas y capas no basta para explicar una decisión. En el ejercicio sí se lee: «banco» atiende 0.41 a «río» y sale con naturaleza 1.23; en «el banco cobra interés» sale con dinero 1.38."]})},cons:{essential:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("b",{children:"Muy costoso:"})," entrenar y servir modelos grandes exige ",e.jsx(a,{k:"gpu",children:"GPU"})," y mucha energía."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Puede inventar:"})," genera texto probable, no verificado. Una cita o una cifra falsa dicha con seguridad es una ",e.jsx(a,{k:"alucinacion",children:"alucinación"}),"."]}),e.jsxs("li",{children:[e.jsx("b",{children:"Hereda los sesgos"})," del texto con que se entrenó, y es difícil saber por qué respondió lo que respondió."]})]}),deepDive:e.jsxs("p",{children:["Para reducir las alucinaciones se le dan documentos de referencia junto con la pregunta y se le pide citar la fuente; aun así hay que comprobar lo importante. El costo cuadrático en la longitud limita cuántos"," ",e.jsx(a,{k:"token",children:"tokens"})," lee de una vez."]})},whenNot:{essential:e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"mlx-rule",children:"No lo uses si la tarea es simple, hay pocos datos o necesitas una respuesta exacta y auditable."}),e.jsxs("p",{children:["Ejemplo: separar spam con unos cientos de correos etiquetados. Naive Bayes o una regresión logística entrenan en un segundo y aciertan casi igual. Y para calcular una cifra, mejor una fórmula o una consulta a la base de datos que un ",e.jsx(a,{k:"llm",children:"modelo de lenguaje"}),"."]})]}),deepDive:e.jsxs("p",{children:["Con secuencias numéricas cortas, como sensores en un dispositivo pequeño, una RNN o un modelo de árboles es más barato. Con ",e.jsx(a,{k:"tabular",children:"datos tabulares"}),", los ",e.jsx(a,{k:"ensamble",children:"ensambles"})," de árboles siguen siendo la primera opción."]})},realWorld:{essential:e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:[e.jsx("b",{children:"ChatGPT y la traducción automática."})," El ",e.jsx(a,{k:"transformer",children:"Transformer"})," nació en 2017 para traducir, en el artículo «Attention Is All You Need» («La atención es todo lo que necesitas»)."]}),e.jsxs("p",{children:[e.jsx(a,{k:"llm",children:"ChatGPT"})," es un modelo tipo ",e.jsx(a,{k:"bertGpt",children:"GPT"}),": predice el siguiente ",e.jsx(a,{k:"token",children:"token"})," ","y fue ajustado para conversar."]}),e.jsxs("p",{children:["El ejercicio calcula a mano la ",e.jsx(a,{k:"atencion",children:"atención"})," de 4 tokens. En «el banco del río», «banco» atiende 0.41 a «río» y sale con naturaleza 1.23; en «el banco cobra interés», con dinero 1.38. Con"," ",e.jsx(a,{k:"mascaraCausal",children:"máscara causal"}),", «banco» aún no ve «río». Al invertir la frase, «banco» cambia 0.00 sin posición y 0.30 con ella."]})]}),deepDive:e.jsxs("p",{children:["Un modelo de lenguaje, por sí solo, no consulta una base de datos de hechos: elige palabras probables. Por eso redacta y traduce con fluidez, pero puede ",e.jsx(a,{k:"alucinacion",children:"alucinar"}),". El notebook de Colab trae una celda opcional con la misma atención en ",e.jsx(a,{k:"pytorch",children:"PyTorch"}),", que da los mismos pesos."]})}},Ova:B,python:{code:R,expectedOutput:U,colabNotebook:"transformer"},inYourField:[{area:"Civil",example:"buscar en cientos de especificaciones técnicas el párrafo que responde una duda, por significado y no por palabra exacta."},{area:"Industrial",example:"clasificar los reportes de fallas escritos por los operarios según el equipo y la causa probable."},{area:"Sistemas",example:"asistentes que sugieren código; el código que proponen hay que revisarlo y probarlo como cualquier otro."}],alternatives:["naive-bayes","rnn"]};export{Q as default};
