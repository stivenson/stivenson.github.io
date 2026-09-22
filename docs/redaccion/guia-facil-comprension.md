# Guía de redacción de fácil comprensión

Insumo para un futuro skill de redacción. Reúne las pautas que Stivenson pidió al escribir el artículo «Python en GPU NVIDIA» (septiembre de 2026) y lo que se aplicó en él.

## Principio

El lector debe entender cada párrafo sin conocimientos previos del tema. La profundidad (fuentes científicas, cifras exactas) se mantiene; lo que se simplifica es la forma de contarla.

## Pautas

1. **Conclusión primero.** Abrir con la idea central en una o dos líneas (un bloque de cita en negrita) y desarrollarla después.
2. **Frases cortas.** Una idea por frase. Evitar subordinadas encadenadas.
3. **Analogías cortas o ninguna.** Si hay analogía, que quepa en una o dos frases. Una analogía larga, con varios elementos (chef, ayudantes, papas, puerta…), añade su propia complejidad: el lector tiene que entender la analogía además del tema. Si se puede decir directo («la CPU tiene pocos núcleos muy capaces; la GPU, miles de núcleos simples»), se dice directo.
4. **Ejemplo con números antes que la fórmula.** Primero el caso concreto («si tardas 10 minutos y 9 se pueden acelerar, nunca bajas de 1 minuto»), después la fórmula, marcada como opcional («solo para quien la quiera»), con cada variable explicada.
5. **Tablas para comparar.** Cuando hay cifras de varias fuentes o escenarios, una tabla con una columna de «condiciones» (hardware, tamaño de datos, contra qué se compara).
6. **Jerga en el glosario emergente.** Cada término técnico lleva una ficha 💡 la primera vez que aparece: qué es en una frase y por qué importa aquí en otra. El texto principal se sigue entendiendo sin abrirla.
7. **Traducir los títulos de los papers.** Citar el título original en las referencias y parafrasearlo en español en el cuerpo.
8. **Separar las cifras del fabricante de la evidencia independiente.** Decir siempre bajo qué condiciones se obtuvo cada cifra.
9. **Decir qué se midió y qué no.** Marcar el código ilustrativo que no se ejecutó y los datos leídos de una foto («tómalos como aproximados»).
10. **Cerrar cada sección con una regla práctica** en un bloque de cita: lo que el lector debe llevarse.
11. **Checklist al final** con casillas (☐) para decidir y actuar.

## Qué evitar

- Analogías extendidas que vuelven a aparecer a lo largo del texto («aquí vuelve la puerta de la cocina»).
- Fórmulas sin un ejemplo numérico al lado.
- Cifras sueltas («150× más rápido») sin decir contra qué se comparan.
