# Bitácora vertical · simulador de cálculo

Simulador didáctico del avión C172 con JSBSim 1.3.3 y Phaser 4.2.1. La interfaz permite solicitar corridas nuevas al backend de Railway y recorrer las 601 muestras; si el servicio no está disponible, reproduce el registro guardado.

## Alcance de esta página

GitHub Pages sirve la interfaz estática. JSBSim se ejecuta en el backend privado de Railway, no en el navegador; Phaser anima las muestras devueltas y la interfaz integra `−V_Down` para compararlo con el cambio de altitud. La primera animación inicia cuando el diagrama entra en pantalla, respetando la preferencia de movimiento reducido. Si el API no está disponible, carga `data/run.json`. Esta demostración no representa ni valida un vuelo real.

## Atribuciones

- Stivenson Rincón Mora, proyecto académico de Cálculo Integral.
- Phaser 4.2.1, motor de renderizado web; licencia incluida en `vendor/PHASER-LICENSE.md`.
- JSBSim 1.3.3 generó la telemetría publicada. La página no distribuye la biblioteca JSBSim ni el modelo de aeronave.

El JavaScript de distribución está minificado y se publica sin mapas de fuentes. Eso dificulta la lectura casual, pero cualquier código servido al navegador puede inspeccionarse; la telemetría JSON también es pública. Al pulsar «JSBSim» se abre una explicación del paquete, referencias oficiales y un glosario.
