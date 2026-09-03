---
title: "Tu primera API con base de datos: la teoría antes que el framework"
date: "2026-09-02"
slug: "primera-api-con-base-de-datos"
description: "Qué es de verdad una API sobre una base de datos —HTTP, verbos, códigos de estado, recursos y restricciones— y luego los dos caminos para construirla: PostgREST, que la genera desde el esquema, y Flask, que la escribes a mano."
tags: ["API", "REST", "PostgreSQL", "PostgREST", "Flask", "Backend"]
---

# **Tu primera API con base de datos: la teoría antes que el framework**

## **📌 Introducción: una API es un contrato, no un montón de rutas**

Casi todos los tutoriales de «tu primera API» empiezan instalando algo. Este empieza un paso antes, porque el error que más caro sale no es de framework: es no haber entendido qué se está prometiendo.

Una API sobre una base de datos es **un contrato entre dos programas que no se conocen**. Dice qué se puede pedir, con qué palabras, qué llega de vuelta y qué pasa cuando algo va mal. El framework es la manera de cumplir ese contrato, no el contrato.

Y una vez lo ves así, aparece la decisión que estructura todo el artículo: hay **dos maneras honestas de cumplirlo**.

| | La API la genera… | Tú escribes… | Brilla cuando… |
|---|---|---|---|
| **PostgREST** | la base de datos, leyendo su propio esquema | SQL: tablas, restricciones, roles, políticas | el trabajo es exponer datos con filtros, orden y permisos |
| **Flask** | tu código, ruta por ruta | Python: rutas, validación, transacciones, errores | hay lógica, orquestación o efectos fuera de la base |

La trampa es la tercera opción, la que no está en la tabla y es la que más se ve: **escribir a mano un CRUD que solo repite el esquema**. Eso es PostgREST hecho peor, más lento de mantener y con más sitios donde equivocarse.

> Si tu endpoint hace `SELECT`, convierte a JSON y devuelve — y nada más — no has escrito una API: has escrito una traducción manual de tu esquema. Que sea buena idea o no depende de si algún día vas a añadir la parte que sí es tuya.

### **La lengua de color de este artículo**

Igual que en las visualizaciones, cada color significa lo mismo de principio a fin:

- <span style="color:#06b6d4"><strong>cian</strong></span> — la petición: lo que envía el cliente
- <span style="color:#10b981"><strong>esmeralda</strong></span> — la respuesta cuando sale bien
- <span style="color:#f43f5e"><strong>rosa</strong></span> — el error
- <span style="color:#a855f7"><strong>violeta</strong></span> — el esquema de la base de datos
- <span style="color:#f59e0b"><strong>ámbar</strong></span> — el código que escribes tú

Guarda las dos últimas: la segunda mitad del artículo es, literalmente, ver cuánto <span style="color:#a855f7">violeta</span> y cuánto <span style="color:#f59e0b">ámbar</span> hace falta para el mismo trabajo.

---

# **Parte I — La teoría**

## **🌐 Qué está pasando de verdad**

Un cliente —un navegador, una app móvil, un script de Python— abre una conexión a un servidor, envía un bloque de texto y recibe otro bloque de texto. Eso es todo. HTTP es un formato de mensajes, y los dos mensajes tienen la misma forma:

```
línea inicial      ← qué quiero / cómo salió
cabeceras          ← metadatos sobre el mensaje
(línea en blanco)
cuerpo             ← los datos, si los hay
```

Hay una propiedad de HTTP que conviene tener clara desde el primer día: **es sin estado**. El servidor no recuerda nada entre una petición y la siguiente. Cada mensaje llega solo y tiene que traer todo lo necesario para ser entendido — incluida la prueba de quién eres. Por eso el token de autenticación viaja en *cada* petición y no «se inicia sesión» en el sentido de una aplicación de escritorio.

De ahí sale casi todo lo demás. Que el servidor no recuerde nada es lo que permite poner cinco servidores detrás de un balanceador sin coordinarlos, cachear respuestas en un proxy y reintentar peticiones sin miedo.

### **Míralo en el cable**

Antes de seguir con la teoría, juega con ella. Arma peticiones distintas y mira exactamente qué viaja y qué vuelve:

<iframe src="/ovas/api-http-anatomia.html" title="Anatomía de una petición HTTP: arma la petición y mira la respuesta" loading="lazy"></iframe>

Fíjate especialmente en la tira de abajo, la **escalera de comprobaciones**. Cada respuesta se decide en un peldaño concreto y el orden no es decorativo — volveremos a él en dos secciones.

---

## **🔤 Los verbos: el idioma ya existe**

El error más común de una primera API es inventar un vocabulario que HTTP ya tenía:

```
❌ POST /obtenerLibro
❌ POST /borrarLibro?id=7
❌ GET  /crearPrestamo?libro=42&socio=8
```

Eso no es «REST simplificado», es RPC con URLs bonitas. Y el problema no es de estilo: **rompe garantías reales**. Ese último `GET` que crea un préstamo es una bomba, porque un `GET` promete no cambiar nada — y hay proxies, precargadores del navegador y rastreadores que llaman a los `GET` que encuentran, sin preguntar.

[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), que desde 2022 es *la* referencia de la semántica de HTTP, define dos propiedades que hay que memorizar:

- **Seguro** — «sus semánticas son esencialmente de solo lectura; los efectos secundarios no son esenciales al propósito del método».
- **Idempotente** — «N peticiones idénticas tienen el mismo efecto que una sola».

| Verbo | Seguro | Idempotente | Para qué es |
|---|---|---|---|
| `GET` | ✅ | ✅ | leer un recurso |
| `HEAD` | ✅ | ✅ | leer solo las cabeceras |
| `OPTIONS` | ✅ | ✅ | preguntar qué se puede hacer aquí |
| `POST` | ❌ | ❌ | crear dentro de una colección; **el servidor elige la URL** |
| `PUT` | ❌ | ✅ | reemplazar el recurso entero en una URL que **tú** eliges |
| `PATCH` | ❌ | ❌ | modificar algunos campos |
| `DELETE` | ❌ | ✅ | borrar |

Dos consecuencias prácticas que casi nadie explica:

**`POST` es el único que no es idempotente**, y por eso reintentar un `POST` tras un *timeout* es peligroso: puede que la primera llamada sí llegara y acabes con dos préstamos. Reintentar un `PUT` o un `DELETE` no tiene ese riesgo. Cuando necesites que un `POST` sea seguro de reintentar, la solución es una **clave de idempotencia** que el cliente genera y el servidor recuerda.

**`PUT` reemplaza, `PATCH` modifica.** Si mandas `PUT /libros/7` con solo `{"ejemplares": 6}`, la lectura literal del estándar es que el resto de campos desaparecen. Confundirlos es cómo se pierden datos sin que salte ninguna alarma.

---

## **🚦 Los códigos de estado, y la escalera que los ordena**

Esto es lo que devuelve una primera API mal hecha:

```
HTTP/1.1 200 OK

{ "error": true, "mensaje": "no encontrado" }
```

Un `200` diciendo que algo falló obliga a **todos** los clientes a leer el cuerpo para saber si hubo error. Rompe los reintentos automáticos, rompe el caché, rompe el panel de monitorización que cuenta respuestas por código y rompe a la persona que integre tu API el año que viene.

El código de estado es la primera línea de la respuesta por una razón: **es la parte que se lee sin entender nada del dominio**. Úsalo.

| Código | Significa | Cuándo |
|---|---|---|
| `200 OK` | salió bien y hay cuerpo | lecturas, y modificaciones que devuelven el recurso |
| `201 Created` | se creó algo nuevo | tras un `POST` — **y con cabecera `Location`** |
| `204 No Content` | salió bien y no hay nada que decir | tras un `DELETE` |
| `206 Partial Content` | te doy un tramo | respuestas paginadas con `Content-Range` |
| `400 Bad Request` | no pude leer lo que enviaste | JSON roto, sintaxis inválida |
| `401 Unauthorized` | **no sé quién eres** | falta el token o no es válido |
| `403 Forbidden` | sé quién eres y **no puedes** | el rol no tiene ese permiso |
| `404 Not Found` | no existe | id inexistente |
| `409 Conflict` | choca con lo que ya hay | `unique` violado, clave foránea, regla de negocio |
| `422 Unprocessable Content` | te leí bien, pero no tiene sentido | falta un campo obligatorio, tipo incorrecto |
| `429 Too Many Requests` | frena | límite de peticiones |
| `500 Internal Server Error` | se rompió algo **mío** | y nunca por culpa del cliente |

Cuatro distinciones que hay que tener afiladas:

**`401` frente a `403`.** El primero es sobre *identidad*: reintentar con credenciales tiene sentido, y por eso el `401` obliga a incluir la cabecera `WWW-Authenticate` diciendo cómo. El segundo es sobre *permisos*: reintentar con el mismo token no va a cambiar nada.

**`400` frente a `422`.** `400` es sintaxis — no pude abrir el sobre. `422` es semántica: el JSON estaba perfecto pero le falta el título. RFC 9110 lo define como *«el cuerpo enviado no se puede procesar porque el contenido tiene errores semánticos»*, y de paso lo renombró: hoy es **Unprocessable Content**, ya no *Unprocessable Entity*.

**`422` frente a `409`.** `422` es sobre la petición en sí misma; `409` es sobre el choque con **el estado actual del sistema**. Un ISBN duplicado es `409`, porque la petición sería perfectamente válida en una base de datos vacía.

**Una colección vacía es `200 []`, nunca `404`.** La colección existe; lo vacío es el resultado. Un `404` ahí obliga al cliente a distinguir entre «no hay libros de ese autor» y «me equivoqué de URL».

### **El orden de las comprobaciones**

Los códigos no se eligen sueltos: salen de una escalera, y cada peldaño supone que los anteriores ya pasaron.

```
ruta → identidad → permiso → existe → sintaxis → reglas → estado → listo
405     401         403       404      400        422      409      2xx
```

Ese orden tiene consecuencias que se ven en la visualización de arriba. `POST /libros/7` responde `405`, no `404`, aunque el libro 7 no existiera: el problema es la **forma** de la petición, y eso se decide antes de mirar la base de datos. Y la comprobación de identidad va antes que la de existencia, para no filtrar qué ids existen a quien no ha demostrado ser nadie.

Para los cuerpos de error, hay un formato estándar y casi nadie lo usa: **[RFC 9457, *Problem Details for HTTP APIs*](https://www.rfc-editor.org/rfc/rfc9457.html)** (agosto de 2023, sustituye al RFC 7807). Es un JSON con `type`, `title`, `status` y `detail`, servido como `application/problem+json`. No es obligatorio, pero adoptarlo te ahorra inventarte un formato de error propio — que es lo que acabarás haciendo.

---

## **🗂️ Recursos, no acciones**

La regla de diseño de URL cabe en una frase: **las rutas son sustantivos, los verbos ya los pone HTTP**.

```
✅ GET    /libros              lista
✅ GET    /libros/7            uno
✅ POST   /libros              crear
✅ PATCH  /libros/7            modificar
✅ DELETE /libros/7            borrar
✅ GET    /socios/8/prestamos  los préstamos de un socio
```

Un par de decisiones que conviene tomar una vez y no volver a pensar: plural para las colecciones (`/libros`, no `/libro`), minúsculas con guiones (`/prestamos-vencidos`), y **nada de extensiones** (`.json` en la URL es trabajo de la cabecera `Accept`).

Y lo que **no** va en la ruta: los filtros. `/libros/disponibles` parece cómodo hasta que necesitas disponibles *de un autor* ordenados *por título*. Los filtros son parámetros de consulta, que se combinan; las rutas no.

```
✅ GET /libros?ejemplares=gt.0&autor_id=eq.3&order=titulo.asc
❌ GET /libros/disponibles/del-autor/3/ordenados-por-titulo
```

### **El elefante: esto que estamos haciendo no es REST**

Conviene decirlo con todas las letras, porque la industria lleva veinte años usando mal la palabra.

REST lo definió **Roy Fielding** en su tesis doctoral de 2000, y una de sus restricciones es *HATEOAS*: las respuestas deben incluir los enlaces que dicen qué se puede hacer a continuación, de modo que un cliente pueda navegar la API **sin conocer de antemano ninguna URL salvo la inicial**. El **modelo de madurez de Richardson** lo ordena en niveles: 0 (un solo endpoint, todo por `POST`), 1 (recursos con URL propia), 2 (verbos y códigos de estado), 3 (hipermedia).

Prácticamente todo lo que se llama REST —incluido lo de este artículo— es **nivel 2**. Y Fielding fue explícito al respecto en [su entrada de 2008](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven):

> *«Me está frustrando la cantidad de gente que llama API REST a cualquier interfaz basada en HTTP. […] si el motor del estado de la aplicación no está dirigido por hipertexto, entonces no puede ser RESTful ni puede ser una API REST. Punto.»*

No lo cuento para que persigas el nivel 3 — pocas APIs lo necesitan y el coste es real. Lo cuento porque **saber qué estás construyendo vale más que la etiqueta**. Estás haciendo una API HTTP orientada a recursos, que es exactamente lo que hace falta aquí. Llámalo REST si quieres; ahora ya sabes lo que estás diciendo.

---

## **🏛️ La base de datos es el contrato de verdad**

Llegamos a la idea que separa una API que aguanta de una que se cae al primer imprevisto.

**Validar en Python es experiencia de usuario. Validar en la base de datos es la verdad.**

La razón es simple: tu endpoint no es el único camino hacia los datos. También están el script de migración, la tarea nocturna, la consola de `psql` que alguien abre a las tres de la mañana, el segundo servicio que el equipo escribió el año pasado. Una regla que vive en `views.py` protege exactamente **un** camino.

Así que las reglas van en el esquema, y el endpoint las repite solo para dar mensajes bonitos:

```sql
create schema api;

create table api.autor (
  id     int  primary key generated always as identity,
  nombre text not null check (length(trim(nombre)) > 0)
);

create table api.socio (
  id     int  primary key generated always as identity,
  nombre text not null,
  email  text not null unique
);

create table api.libro (
  id         int  primary key generated always as identity,
  autor_id   int  not null references api.autor(id) on delete restrict,
  titulo     text not null check (length(trim(titulo)) > 0),
  isbn       text not null unique check (isbn ~ '^\d{13}$'),
  ejemplares int  not null default 1 check (ejemplares >= 0)
);

create table api.prestamo (
  id          int  primary key generated always as identity,
  libro_id    int  not null references api.libro(id) on delete restrict,
  socio_id    int  not null references api.socio(id) on delete restrict,
  prestado_el date not null default current_date,
  devuelto_el date,
  check (devuelto_el is null or devuelto_el >= prestado_el)
);

-- Índice parcial: solo indexa los préstamos abiertos, que es
-- lo único que consultamos para el límite por socio.
create index prestamo_activo_por_socio
  on api.prestamo (socio_id) where devuelto_el is null;
```

Lee ese bloque otra vez pensando en HTTP. Cada línea es una respuesta de error que ya no tienes que programar:

| En el esquema | Lo que impide | El código que devuelve |
|---|---|---|
| `not null` | crear sin título | `422` |
| `unique (isbn)` | dos libros con el mismo ISBN | `409` |
| `references … on delete restrict` | borrar un libro con préstamos | `409` |
| `check (ejemplares >= 0)` | dejar el stock en negativo | `422` |
| `check (devuelto_el >= prestado_el)` | devolver antes de prestar | `422` |

Esa tabla es el puente entre las dos mitades del artículo. **La mitad de tu API ya está escrita** — en SQL, en el momento de crear las tablas. La pregunta que queda es cuánta de la otra mitad quieres escribir tú.

---

# **Parte II — Dos caminos**

## **🐘 PostgREST: la API que genera la base de datos**

[PostgREST](https://docs.postgrest.org/) es un servidor —escrito en Haskell, un único binario sin dependencias— que se conecta a PostgreSQL, **lee su catálogo** y publica una API HTTP: una ruta por tabla, por vista y por función. La versión actual es la **16.2** (agosto de 2026).

No hay generación de código ni ficheros que sincronizar. Cambias una tabla, recargas el esquema, la API cambió.

Arrancarlo son tres piezas. Los roles:

```sql
-- Quien no se identifica.
create role web_anon nologin;
grant usage  on schema api to web_anon;
grant select on api.libro, api.autor to web_anon;

-- Un socio identificado.
create role socio nologin;
grant usage  on schema api to socio;
grant select on api.libro, api.autor, api.prestamo to socio;

-- El personal de la biblioteca.
create role bibliotecario nologin;
grant usage on schema api to bibliotecario;
grant select, insert, update, delete on all tables in schema api to bibliotecario;

-- El rol con el que PostgREST se conecta: no hereda nada,
-- solo tiene permiso para *convertirse* en los otros tres.
create role authenticator noinherit login password 'cámbiala';
grant web_anon, socio, bibliotecario to authenticator;
```

Y la configuración:

```ini
db-uri       = "postgres://authenticator:cámbiala@localhost:5432/biblioteca"
db-schemas   = "api"
db-anon-role = "web_anon"
jwt-secret   = "un secreto de al menos 32 caracteres"
db-max-rows  = 100
```

### **El modelo de seguridad, que es la parte interesante**

Aquí está la idea que hace a PostgREST distinto de un generador de CRUD cualquiera: **toda la autorización ocurre dentro de PostgreSQL**.

PostgREST se conecta siempre con `authenticator`, un rol casi sin permisos. Cuando llega una petición con un JWT válido, lee el rol de la reclamación correspondiente y ejecuta **`set local role`** hacia ese rol, para esa transacción y solo para ella. Si no hay JWT, se convierte en `db-anon-role`.

Es decir: no hay una capa de permisos en el servidor HTTP que pueda tener un agujero distinto al de la base de datos. **Son la misma capa.**

Sobre eso se apoya *row level security*, que es donde se pone bueno:

```sql
alter table api.prestamo enable row level security;

create policy prestamo_propio on api.prestamo
  for select to socio
  using (
    socio_id = (current_setting('request.jwt.claims', true)
                ::json ->> 'socio_id')::int
  );
```

PostgREST publica las reclamaciones del JWT como un ajuste de transacción, `request.jwt.claims`, y la política lo lee. A partir de ahí, **da igual por dónde entre la consulta**: `GET /prestamo` devuelve solo los del socio, y un `select * from api.prestamo` ejecutado con ese rol también.

### **Lo que sale gratis**

Con las tablas y los roles creados, ya tienes:

```bash
# Filtrar, ordenar, elegir columnas
GET /libro?ejemplares=gt.0&order=titulo.asc&select=titulo,isbn

# Seguir la clave foránea sin escribir el JOIN
GET /libro?select=titulo,autor(nombre)

# O y AND
GET /libro?or=(ejemplares.eq.0,autor_id.eq.3)

# Paginar, con el total en la respuesta
GET /libro
Range-Unit: items
Range: 0-19
Prefer: count=exact
#  --> 206 Partial Content
#  --> Content-Range: 0-19/348
```

Los operadores son los de SQL con nombre corto: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`, `is`, `fts` para búsqueda de texto completo. El `select=titulo,autor(nombre)` merece un momento: PostgREST **no adivina** la relación, la deduce de la clave foránea. Sin `references`, ese embebido no existe.

Para el conteo hay tres modos, porque `count(*)` exacto es caro: `count=exact`, `count=planned` (usa las estadísticas del planificador) y `count=estimated`, que mezcla los dos según el tamaño.

Y una cosa más, gratis: PostgREST **sirve su propia documentación** en la ruta raíz, generada desde el catálogo, y usa los `COMMENT ON` de tus tablas y columnas como descripciones. Un detalle a tener en cuenta: el formato que emite es **Swagger 2.0**, no OpenAPI 3.x — importa si tu generador de clientes solo entiende la versión moderna.

```sql
comment on table api.libro is
  'Ejemplares del catálogo. El ISBN es único.';
```

### **Lo que no hace**

PostgREST expone datos; no orquesta. En cuanto necesitas mandar un correo, llamar a una pasarela de pago, escribir en S3 o hablar con otro servicio, necesitas un proceso que lo haga. Y la lógica de negocio, si la pones en PostgREST, vive en **PL/pgSQL** — lo cual es perfectamente válido y también es una decisión de equipo con consecuencias: versionar, probar y depurar SQL es terreno menos cómodo que Python para casi todo el mundo.

---

## **🐍 Flask: la API que escribes tú**

[Flask](https://flask.palletsprojects.com/) va en la dirección contraria: no asume nada. La versión actual es la **3.1.3** (febrero de 2026) y requiere Python 3.9 o superior.

Para la base de datos uso **psycopg 3** directamente, sin ORM. Para una primera API es lo correcto: ves el SQL que se ejecuta, y eso es justo lo que quieres estar aprendiendo.

```python
import os
from flask import Flask, request, jsonify, abort, g
from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row
from psycopg.errors import UniqueViolation, ForeignKeyViolation, CheckViolation

# Un pool, no una conexión: abrir una conexión por petición
# es lento y agota los slots de PostgreSQL.
pool = ConnectionPool(
    os.environ["DATABASE_URL"],
    kwargs={"row_factory": dict_row},
    min_size=2, max_size=10,
)

app = Flask(__name__)
```

Nada de credenciales en el código: `DATABASE_URL` viene del entorno. Es la primera regla y la que más se incumple.

### **Leer**

```python
COLUMNAS_ORDENABLES = {"id", "titulo", "isbn", "ejemplares"}

@app.get("/libros")
def listar_libros():
    orden = request.args.get("orden", "id")
    # El nombre de columna NO se puede pasar como parámetro,
    # así que la lista blanca no es opcional.
    if orden not in COLUMNAS_ORDENABLES:
        abort(422, "columna de orden no permitida")

    limite = min(request.args.get("limit", type=int, default=20), 100)
    desde  = request.args.get("offset", type=int, default=0)

    with pool.connection() as con:
        filas = con.execute(
            f"select id, titulo, isbn, ejemplares from api.libro"
            f" order by {orden} limit %s offset %s",
            (limite, desde),
        ).fetchall()
        total = con.execute("select count(*) from api.libro").fetchone()["count"]

    resp = jsonify(filas)
    resp.headers["Content-Range"] = f"{desde}-{desde + len(filas) - 1}/{total}"
    resp.status_code = 206 if total > len(filas) else 200
    return resp
```

Tres cosas aquí valen por todo el artículo:

Los **valores** van como parámetros (`%s`) y psycopg los escapa. Los **nombres de columna** no se pueden parametrizar, así que se validan contra una lista blanca. Interpolar `request.args["orden"]` directamente en el SQL es la inyección de manual, y funciona perfectamente hasta que deja de hacerlo.

El `min(..., 100)` no es cosmético. Sin él, `?limit=999999999` es una denegación de servicio de un carácter. (PostgREST tiene el mismo tope: `db-max-rows`.)

Y **siempre se pagina**. Una API que devuelve la tabla entera funciona en desarrollo y se cae el día que la tabla crece.

### **Crear**

```python
@app.post("/libros")
def crear_libro():
    datos = request.get_json(silent=True)
    if datos is None:
        abort(400, "el cuerpo no es JSON válido")

    faltan = {"titulo", "autor_id", "isbn"} - datos.keys()
    if faltan:
        abort(422, f"faltan campos obligatorios: {sorted(faltan)}")

    try:
        with pool.connection() as con:
            fila = con.execute(
                "insert into api.libro (titulo, autor_id, isbn, ejemplares)"
                " values (%s, %s, %s, %s) returning *",
                (datos["titulo"], datos["autor_id"],
                 datos["isbn"], datos.get("ejemplares", 1)),
            ).fetchone()
    except UniqueViolation:
        abort(409, "ya existe un libro con ese ISBN")
    except ForeignKeyViolation:
        abort(422, "ese autor_id no existe")
    except CheckViolation:
        abort(422, "algún campo viola una restricción del esquema")

    resp = jsonify(fila)
    resp.status_code = 201
    resp.headers["Location"] = f"/libros/{fila['id']}"
    return resp
```

Mira bien los tres `except`. **No comprueban antes; capturan después.** Es lo correcto, y es el punto donde más gente se equivoca.

La versión intuitiva —`select` para ver si el ISBN existe y luego `insert`— tiene una carrera: entre las dos consultas cabe otra petición haciendo lo mismo. El índice `unique` es el único árbitro que no se puede colar, así que el patrón sano es intentarlo y traducir el error. Cada `except` de ahí arriba es una restricción del <span style="color:#a855f7">esquema</span> convertida en un código HTTP.

### **Dónde Flask se gana el sueldo**

Todo lo anterior lo hacía PostgREST con cero líneas. Esto ya no:

```python
@app.post("/prestamos")
def prestar():
    datos = request.get_json()

    # El bloque es una transacción: si algo lanza, se deshace entero.
    with pool.connection() as con:
        # Bloqueo obligatorio. Sin él, dos peticiones simultáneas
        # cuentan "2 activos" a la vez y ambas insertan el cuarto.
        con.execute("select 1 from api.socio where id = %s for update",
                    (datos["socio_id"],))

        activos = con.execute(
            "select count(*) from api.prestamo"
            " where socio_id = %s and devuelto_el is null",
            (datos["socio_id"],),
        ).fetchone()["count"]

        if activos >= 3:
            abort(409, "el socio ya tiene 3 préstamos sin devolver")

        fila = con.execute(
            "insert into api.prestamo (libro_id, socio_id)"
            " values (%s, %s) returning *",
            (datos["libro_id"], datos["socio_id"]),
        ).fetchone()

    # La transacción ya cerró y el préstamo está guardado:
    # solo ahora tiene sentido avisar al mundo exterior.
    cola.enqueue(enviar_correo_prestamo, fila["id"])
    return jsonify(fila), 201
```

El `for update` es el corazón del ejemplo, y es el fallo clásico de la primera API: comprobar y luego escribir sin bloquear nada. Dos peticiones a la vez leen «2 activos», las dos deciden que caben, las dos insertan, y el socio acaba con cuatro préstamos. **Ningún framework arregla eso**; lo arregla entender la transacción.

Y fíjate en la última línea: el correo se manda **después** del commit, y por una cola. Meter una llamada HTTP dentro de la transacción es cómo se bloquea una base de datos entera esperando a que responda un servidor de correo.

---

## **⚖️ El mismo trabajo, lado a lado**

Ocho operaciones, resueltas por los dos caminos. Recórrelas en orden — el argumento está en el orden:

<iframe src="/ovas/api-postgrest-vs-flask.html" title="Comparador: la misma operación con PostgREST y con Flask" loading="lazy"></iframe>

Las primeras cinco son <span style="color:#a855f7">violeta</span> puro: PostgREST resuelve con cero líneas lo que en Flask cuesta entre 8 y 24. En la sexta empieza a equilibrarse. La séptima —la regla de los tres préstamos— es un empate honesto: los dos caminos cuestan lo mismo porque el trabajo de verdad es el mismo. Y la octava se cae del lado <span style="color:#f59e0b">ámbar</span>, porque PostgREST no orquesta.

### **Cómo elegir**

| Si tu caso es… | Empieza por |
|---|---|
| Panel interno, prototipo, app móvil que solo consulta y guarda | **PostgREST** |
| Muchas tablas, permisos por fila, poco código propio | **PostgREST** + RLS |
| Reglas de negocio, pagos, correos, integraciones | **Flask** |
| Las dos cosas | **Las dos**: PostgREST para los datos, Flask para lo demás |

Esa última fila no es un empate diplomático, es el diseño que más se ve funcionando: **PostgREST para el CRUD, un servicio propio para la lógica**, hablando los dos con la misma base de datos y compartiendo las mismas restricciones y las mismas políticas RLS. La base es la frontera común, no un detalle de implementación de uno de los dos.

Y si eliges Flask, aplica el criterio de la introducción: si un endpoint solo hace `SELECT` y `jsonify`, pregúntate si algún día tendrá algo más. Si la respuesta es no, ese endpoint sobra.

---

## **🩹 Los siete pecados de la primera API**

Todos los he cometido. Los pongo en el orden en que suelen doler:

1. **Interpolar SQL con f-strings.** `f"... where id = {request.args['id']}"` es una inyección. Los valores van como parámetros; los identificadores, contra lista blanca.
2. **Devolver `200` para todo.** Obliga a leer el cuerpo para saber si falló, y rompe reintentos, caché y monitorización.
3. **No paginar.** Funciona con 50 filas y se cae con 500 000.
4. **Validar solo en Python.** Hay otros caminos hacia los datos: el script, el `psql`, el otro servicio.
5. **Comprobar y luego escribir sin transacción.** El fallo de concurrencia clásico. Restricción en la base o `for update`; no hay tercera opción.
6. **El N+1.** Recorrer los libros y pedir `libro.autor.nombre` dentro del bucle son 1 + N consultas. Un `JOIN` es una.
7. **Credenciales en el repositorio.** Y una vez hecho el commit, ya no basta con borrarlas: hay que rotarlas, porque siguen en el historial.

---

## **🔒 Lo mínimo no negociable**

Antes de que nadie más pueda llamar a tu API:

- **HTTPS**, siempre. Un JWT en claro es un JWT de cualquiera.
- **Secretos por variables de entorno**, nunca en el código ni en el repositorio.
- **Un rol de base de datos por privilegio.** Tu API no se conecta como superusuario. En PostgREST esto viene impuesto; en Flask hay que acordarse.
- **Límite de peticiones** (`429`) en el proxy, delante de la aplicación.
- **CORS explícito.** `Access-Control-Allow-Origin: *` combinado con credenciales es un agujero, no una configuración.
- **Nunca devolver el `traceback` al cliente.** Un `500` lleva un mensaje genérico y un identificador; el detalle va a tus logs.
- **Y por defecto, denegar.** Las columnas y las tablas que no has expuesto a propósito no deberían estar expuestas.

---

## **🎯 Conclusión**

Si te quedas con tres cosas:

**El contrato es lo primero.** Verbos, códigos de estado y forma de las URLs son un vocabulario que ya existe, está escrito en RFC 9110 y lo entiende todo el mundo. Inventarte uno propio solo consigue que tu API haya que explicarla.

**Las reglas viven en el esquema.** `not null`, `unique`, `references`, `check` y las políticas de RLS se cumplen por todos los caminos, no solo por el tuyo. La validación en Python es para dar buenos mensajes, no para garantizar nada.

**Y la pregunta final no es «¿PostgREST o Flask?», es «¿cuánto de mi API es realmente mío?».** Si la respuesta es «casi nada, son consultas», PostgREST te ahorra un servicio entero que mantener. Si hay reglas, orquestación y efectos fuera de la base, escríbelo tú — y que PostgREST se encargue del resto.

Lo que no tiene sentido es la tercera vía por omisión: escribir a mano, endpoint a endpoint, una traducción literal de un esquema que ya sabía decirlo todo.

---

## **📚 Referencias**

**Los estándares**

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) (junio de 2022, STD 97). Métodos, códigos de estado y cabeceras. Sustituye al RFC 7231 y a la mayor parte de la serie 723x.
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) (agosto de 2023). El formato estándar para cuerpos de error; sustituye al RFC 7807.
- [RFC 5789 — PATCH Method for HTTP](https://www.rfc-editor.org/rfc/rfc5789.html). Define `PATCH` y explica por qué no es idempotente.

**REST, el de verdad**

- Roy T. Fielding, [*Architectural Styles and the Design of Network-based Software Architectures*](https://roy.gbiv.com/pubs/dissertation/top.htm) (tesis doctoral, 2000). El capítulo 5 es donde se define REST.
- Roy T. Fielding, [*REST APIs must be hypertext-driven*](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) (2008).
- Martin Fowler, [*Richardson Maturity Model*](https://martinfowler.com/articles/richardsonMaturityModel.html).

**PostgREST**

- [Documentación de PostgREST 16](https://docs.postgrest.org/en/v16/)
- [Autenticación y roles](https://docs.postgrest.org/en/v16/references/auth.html)
- [Tablas y vistas: operadores, filtros y embebidos](https://docs.postgrest.org/en/v16/references/api/tables_views.html)
- [Paginación y conteo](https://docs.postgrest.org/en/v16/references/api/pagination_count.html)
- [Notas de la versión 16.0](https://github.com/PostgREST/postgrest/releases/tag/v16.0)

**Flask, psycopg y PostgreSQL**

- [Documentación de Flask 3.1](https://flask.palletsprojects.com/en/stable/)
- [psycopg 3 — pool de conexiones](https://www.psycopg.org/psycopg3/docs/advanced/pool.html)
- [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
