export interface GlossaryEntry {
  term: string;
  /** Qué es, en una frase. */
  what: string;
  /** Por qué importa aquí, en otra. */
  why: string;
}

/**
 * Glosario 💡 del explorador. Un solo lugar para toda la jerga: los
 * algoritmos lo citan con <G k="clave">. El texto principal se debe
 * entender sin abrir ninguna ficha.
 */
export const GLOSSARY = {
  feature: {
    term: 'Feature (variable de entrada)',
    what: 'Cada dato que el modelo usa para decidir: los m², el número de habitaciones. En una tabla, cada columna de entrada.',
    why: 'Elegir buenas features suele pesar más que elegir el algoritmo.',
  },
  etiqueta: {
    term: 'Etiqueta (variable objetivo)',
    what: 'La respuesta que queremos predecir: el precio de la casa, «spam» o «no spam».',
    why: 'Si tus datos traen la etiqueta, el problema es supervisado.',
  },
  supervisado: {
    term: 'Aprendizaje supervisado',
    what: 'El modelo aprende de ejemplos que ya traen la respuesta correcta.',
    why: 'Es estudiar con el solucionario: funciona muy bien, pero necesitas datos etiquetados, que a veces cuestan.',
  },
  noSupervisado: {
    term: 'Aprendizaje no supervisado',
    what: 'El modelo busca estructura (grupos, patrones) en datos que no traen respuesta.',
    why: 'Sirve cuando no tienes etiquetas, pero nadie te confirma si los grupos «están bien».',
  },
  entrenamientoPrueba: {
    term: 'Datos de entrenamiento y de prueba',
    what: 'Los datos se separan: con unos el modelo aprende y con otros, que nunca vio, se mide.',
    why: 'Medir con los datos de entrenamiento es calificar un examen con preguntas que ya conocías.',
  },
  residuo: {
    term: 'Residuo',
    what: 'La diferencia entre el valor real de un punto y el que predice el modelo.',
    why: 'Los residuos grandes señalan dónde y cuánto se equivoca el modelo.',
  },
  mse: {
    term: 'MSE (error cuadrático medio)',
    what: 'El promedio de los residuos elevados al cuadrado.',
    why: 'El cuadrado castiga mucho los errores grandes: por eso un solo outlier mueve tanto la recta.',
  },
  r2: {
    term: 'R² (coeficiente de determinación)',
    what: 'Qué fracción de la variación de los datos explica el modelo: 1 es perfecto; 0 es lo mismo que predecir siempre el promedio.',
    why: 'Permite comparar modelos sin depender de las unidades (pesos, metros, grados).',
  },
  outlier: {
    term: 'Outlier (valor atípico)',
    what: 'Un dato muy alejado del resto, por un error de medición o por un caso raro de verdad.',
    why: 'Algunos algoritmos, como la regresión lineal, se dejan arrastrar mucho por ellos.',
  },
  overfitting: {
    term: 'Overfitting (sobreajuste)',
    what: 'El modelo memoriza los datos de entrenamiento, ruido incluido, y falla con datos nuevos.',
    why: 'Se detecta cuando acierta mucho en entrenamiento y bastante menos en prueba.',
  },
  hiperparametro: {
    term: 'Hiperparámetro',
    what: 'Un ajuste que eliges tú antes de entrenar (k en KNN, la profundidad de un árbol); el modelo no lo aprende.',
    why: 'Elegirlo bien suele decidir entre un modelo útil y uno que memoriza o que no aprende nada.',
  },
  frontera: {
    term: 'Frontera de decisión',
    what: 'La línea o superficie que separa las zonas donde el modelo predice una clase u otra.',
    why: 'Su forma (recta, escalones, curva) dice qué patrones puede captar el modelo.',
  },
  logOdds: {
    term: 'Log-odds',
    what: 'El logaritmo de «probabilidad de sí ÷ probabilidad de no». Si P = 0.8, los odds son 0.8/0.2 = 4 y el log-odds ≈ 1.39.',
    why: 'La regresión logística supone que el log-odds sube o baja en línea recta con cada feature.',
  },
  umbral: {
    term: 'Umbral de decisión',
    what: 'La probabilidad a partir de la cual decides «sí». Por defecto, 0.5.',
    why: 'Moverlo cambia el balance entre falsas alarmas y casos que se escapan.',
  },
  matrizConfusion: {
    term: 'Matriz de confusión',
    what: 'Tabla que cuenta aciertos y errores por clase: lo real en las filas, lo predicho en las columnas.',
    why: 'Muestra qué tipo de error comete el modelo, no solo cuántos.',
  },
  gini: {
    term: 'Impureza de Gini',
    what: 'Mide qué tan mezcladas están las clases en un grupo: 0 si todos son de la misma clase, 0.5 si están mitad y mitad.',
    why: 'El árbol elige en cada paso la pregunta que más baja la impureza.',
  },
  ruido: {
    term: 'Ruido',
    what: 'Variación de los datos que ningún patrón explica: errores de medición, casos excepcionales.',
    why: 'Un modelo que intenta explicar el ruido está sobreajustando.',
  },
  escalado: {
    term: 'Escalado de features',
    what: 'Llevar todas las features a rangos comparables, por ejemplo media 0 y desviación 1.',
    why: 'Sin escalar, la feature con números grandes (salario en pesos) aplasta a la de números pequeños (edad).',
  },
  altaDimension: {
    term: 'Alta dimensionalidad',
    what: 'Tener muchas features: decenas, cientos o miles de columnas.',
    why: 'Con muchas dimensiones todos los puntos quedan casi igual de lejos entre sí, y las distancias pierden sentido.',
  },
  distancia: {
    term: 'Distancia euclidiana',
    what: 'La distancia en línea recta entre dos puntos: √((x₁−x₂)² + (y₁−y₂)²).',
    why: 'Es la medida de parecido que usa KNN por defecto.',
  },
  ensamble: {
    term: 'Ensamble',
    what: 'Combinar muchos modelos (por ejemplo, cientos de árboles) y promediar o votar sus respuestas.',
    why: 'Reduce la inestabilidad de un modelo solo. Random Forest y Gradient Boosting son ensambles de árboles.',
  },
  interpretable: {
    term: 'Modelo interpretable',
    what: 'Un modelo cuyo razonamiento puedes leer y explicar, como «cada m² suma 2.5 millones».',
    why: 'En crédito, salud o decisiones públicas a menudo es obligatorio explicar por qué se decidió algo.',
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
