# Bitácora vertical · simulador de cálculo

Demo pública de una corrida guardada de JSBSim 1.3.3, visualizada e interactuada con Phaser 4.2.1. La interfaz permite reproducir, pausar, reiniciar, cambiar velocidad, recorrer las 601 muestras y comparar la integral numérica con el cambio de altitud.

## Alcance de esta página

GitHub Pages sirve archivos estáticos: esta demo no ejecuta Python ni JSBSim en el navegador. Presenta una corrida previamente generada por la versión local Python–JSBSim y recalcula la integral de las muestras guardadas. Para crear nuevas corridas, se requiere la aplicación local incluida en el proyecto académico. Esta demostración no representa ni valida un vuelo real.

## Atribuciones

- Stivenson Rincon Mora, proyecto académico de Cálculo Integral.
- Phaser 4.2.1, motor de renderizado web; licencia incluida en `vendor/PHASER-LICENSE.md`.
- JSBSim 1.3.3 generó la telemetría publicada. La página no distribuye la biblioteca JSBSim ni el modelo de aeronave.

El JavaScript de distribución está minificado/ofuscado y se publica sin mapas de fuentes. Eso desalienta la copia casual, pero cualquier código servido al navegador puede inspeccionarse y no puede protegerse de la descarga o ingeniería inversa. La telemetría JSON también es pública.
