# Traductor de Audio en Tiempo Real

Script en Python para capturar y traducir en tiempo real todo el audio que pasa por la tarjeta de sonido del sistema.

## Características

- ✅ Captura de audio del sistema (loopback)
- ✅ Transcripción en tiempo real usando Whisper (OpenAI)
- ✅ Traducción automática usando Google Translate
- ✅ Soporte para múltiples idiomas
- ✅ Procesamiento en tiempo real con múltiples hilos

## Instalación

### Instalación paso a paso (recomendado):

1. **Instala PyTorch primero** (esto asegura compatibilidad con NumPy):

```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
```

2. **Instala NumPy compatible** (versión < 2.0):

```bash
pip install "numpy>=1.21.0,<2.0.0"
```

3. **Instala el resto de dependencias**:

```bash
pip install -r requirements.txt
```

### Instalación rápida (si ya tienes PyTorch instalado):

```bash
pip install -r requirements.txt
```

**Nota importante:** Si encuentras el error `RuntimeError: Numpy is not available`, desinstala y reinstala las dependencias en este orden:

```bash
pip uninstall -y numpy torch torchaudio openai-whisper
pip install "numpy>=1.21.0,<2.0.0" torch torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install openai-whisper deep-translator pyaudio ffmpeg-python
```

**Nota para Windows:** Si tienes problemas instalando `pyaudio`, puedes usar:

```bash
pip install pipwin
pipwin install pyaudio
```

O descarga el wheel apropiado desde: https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio

## Configuración en Windows

Para capturar el audio del sistema, necesitas habilitar "Stereo Mix":

1. Click derecho en el icono de sonido en la barra de tareas
2. Selecciona "Configuración de sonido" o "Sonidos"
3. Ve a la pestaña "Grabación"
4. Click derecho en el área vacía y selecciona "Mostrar dispositivos deshabilitados"
5. Click derecho en "Stereo Mix" y selecciona "Habilitar"
6. Click derecho en "Stereo Mix" y selecciona "Establecer como dispositivo predeterminado"

## Uso

### Uso básico (español a inglés):

```bash
python traductor_audio.py
```

### Especificar idiomas:

```bash
python traductor_audio.py --idioma-origen en --idioma-destino es
```

### Usar un modelo más preciso (más lento):

```bash
python traductor_audio.py --modelo medium
```

### Especificar dispositivo de audio:

```bash
python traductor_audio.py --dispositivo 1
```

## Parámetros

- `--idioma-origen`: Idioma del audio capturado (ej: `es`, `en`, `auto`). Default: `es`
- `--idioma-destino`: Idioma de destino (ej: `en`, `es`, `fr`). Default: `en`
- `--modelo`: Modelo de Whisper (`tiny`, `base`, `small`, `medium`, `large`). Default: `base`
  - `tiny`: Más rápido, menos preciso
  - `base`: Balance entre velocidad y precisión (recomendado)
  - `small`, `medium`, `large`: Más preciso, más lento
- `--dispositivo`: Índice del dispositivo de audio a usar (opcional)

## Ejemplos

### Traducir de inglés a español:

```bash
python traductor_audio.py --idioma-origen en --idioma-destino es
```

### Traducir de cualquier idioma a francés:

```bash
python traductor_audio.py --idioma-origen auto --idioma-destino fr
```

### Usar modelo más preciso para mejor calidad:

```bash
python traductor_audio.py --modelo small --idioma-origen en --idioma-destino es
```

## Notas

- El script procesa segmentos de 5 segundos de audio
- La primera ejecución descargará el modelo de Whisper seleccionado
- Requiere conexión a internet para la traducción (Google Translate)
- El procesamiento puede tener un pequeño retraso dependiendo del modelo usado
- Para mejor rendimiento, usa modelos más pequeños (`tiny` o `base`) en tiempo real

## Solución de Problemas

### Error: "No module named 'pyaudio'"
Instala pyaudio usando pipwin o descarga el wheel manualmente.

### Error: "No se encontró dispositivo loopback"
Asegúrate de haber habilitado "Stereo Mix" en Windows (ver sección de configuración).

### El audio no se captura correctamente
- Verifica que "Stereo Mix" esté habilitado y sea el dispositivo predeterminado
- Prueba diferentes dispositivos usando `--dispositivo` con diferentes índices
- Asegúrate de que haya audio reproduciéndose en el sistema

### El procesamiento es muy lento
- Usa un modelo más pequeño (`tiny` o `base`)
- Reduce `RECORD_SECONDS` en el código para procesar segmentos más cortos

