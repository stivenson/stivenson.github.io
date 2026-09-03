# Datasets

Datos usados por el artículo [De la retina al tensor](https://stivenson.github.io/#/articles/imagen-a-tensor-cnn-glaucoma).

Todo lo que hay aquí se redistribuye bajo **CC BY 4.0**, la misma licencia con la que
lo publicaron sus autores. La atribución de abajo es obligatoria: si reutilizas estos
archivos, cita a los autores originales, no a este repositorio.

---

## `acrima_mini.zip`

Subconjunto de **60 imágenes** (34 glaucomatosas, 26 normales) de la base de datos
**ACRIMA**, muestreado con semilla fija (`random.Random(42)`) sobre las 705 originales.

**Los tamaños originales se conservan a propósito.** Las imágenes de ACRIMA vienen en
258 tamaños distintos y ese hecho es parte de lo que el artículo enseña: reescalarlas
aquí borraría la lección. También se incluyen deliberadamente los dos archivos con
extensión `.JPG` en mayúsculas (`Im702_g_ACRIMA.JPG` y `Im703_g_ACRIMA.JPG`), porque
son la trampa que hace que `glob("*.jpg")` pierda imágenes en silencio.

La etiqueta va en el nombre del archivo: `_g_` significa glaucoma, y su ausencia,
normal. No hay ningún archivo de etiquetas aparte.

> Diaz-Pinto, A., Morales, S., Naranjo, V., Köhler, T., Mossi, J. M., & Navea, A.
> (2019). *CNNs for automatic glaucoma assessment using fundus images: an extensive
> validation.* BioMedical Engineering OnLine, 18(1), 29.
> <https://doi.org/10.1186/s12938-019-0649-y>
>
> Base de datos: <https://doi.org/10.6084/m9.figshare.7613135>
> Licencia: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

Las imágenes se recogieron en FISABIO Oftalmología Médica (Valencia, España), con
consentimiento previo de los pacientes y conforme a la Declaración de Helsinki, y
fueron anotadas por especialistas en glaucoma. Vienen ya recortadas alrededor del
disco óptico.

---

## `../ovas/img/`

Imágenes sueltas que ilustran las visualizaciones del artículo.

| Archivo | Origen | Licencia |
|---|---|---|
| `retina-glaucoma.jpg` | ACRIMA, `Im318_g_ACRIMA.jpg` | CC BY 4.0 |
| `retina-normal.jpg` | ACRIMA, `Im013_ACRIMA.jpg` | CC BY 4.0 |
| `fondo-completo.jpg` | HRF, `01_g.jpg`, reescalada de 3504×2336 a 760×507 | CC BY 4.0 |

Para las dos primeras vale la cita de ACRIMA de arriba. Para la tercera:

> Budai, A., Bock, R., Maier, A., Hornegger, J., & Michelson, G. (2013). *Robust
> Vessel Segmentation in Fundus Images.* International Journal of Biomedical Imaging,
> 2013, 154860. <https://doi.org/10.1155/2013/154860>
>
> Base de datos (High-Resolution Fundus, Universidad de Erlangen-Núremberg):
> <https://www5.cs.fau.de/research/data/fundus-images/>
> Licencia: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

---

## Lo que no está aquí, y por qué

**PAPILA** es la base de datos que el artículo cita al hablar de la fuga por
partición, porque incluye **los dos ojos del mismo paciente** — justo el caso en que
partir por imagen mete al mismo paciente en entrenamiento y en prueba. No se
redistribuye ninguna de sus imágenes: figshare la publica bajo **GPL 3.0+**, una
licencia copyleft pensada para software y incómoda de aplicar a un derivado de datos.
Se cita y se enlaza, nada más.

> Kovalyk, O., Morales-Sánchez, J., Verdú-Monedero, R., Sellés-Navarro, I.,
> Palazón-Cabanes, A., & Sancho-Gómez, J.-L. (2022). *PAPILA: Dataset with fundus
> images and clinical data of both eyes of the same patient for glaucoma assessment.*
> Scientific Data, 9, 291. <https://doi.org/10.1038/s41597-022-01388-1>
