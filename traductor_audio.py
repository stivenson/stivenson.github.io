"""
Script para traducir en tiempo real el audio que pasa por la tarjeta de sonido.
Captura el audio del sistema, lo transcribe y lo traduce.
"""

import pyaudio
import wave
import numpy as np
import whisper
from deep_translator import GoogleTranslator
import threading
import queue
import time
import os
import sys

class TraductorAudio:
    def __init__(self, idioma_origen='es', idioma_destino='en', modelo_whisper='base'):
        """
        Inicializa el traductor de audio.
        
        Args:
            idioma_origen: Idioma del audio capturado (ej: 'es', 'en', 'auto')
            idioma_destino: Idioma al que se traducirá (ej: 'en', 'es', 'fr')
            modelo_whisper: Modelo de Whisper a usar ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.idioma_origen = idioma_origen
        self.idioma_destino = idioma_destino
        self.modelo_whisper = modelo_whisper
        
        # Configuración de audio
        self.CHUNK = 4096  # Tamaño del buffer de audio
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 2  # Estéreo
        self.RATE = 44100  # Frecuencia de muestreo
        self.RECORD_SECONDS = 5  # Duración de cada segmento a transcribir
        
        # Inicializar PyAudio
        self.audio = pyaudio.PyAudio()
        
        # Cola para procesar audio
        self.audio_queue = queue.Queue()
        self.running = False
        
        # Cargar modelo Whisper
        print(f"Cargando modelo Whisper '{modelo_whisper}'...")
        self.model = whisper.load_model(modelo_whisper)
        print("Modelo cargado exitosamente.")
        
        # Inicializar traductor
        self.traductor = GoogleTranslator(source=idioma_origen, target=idioma_destino)
        
    def encontrar_dispositivo_loopback(self):
        """
        Encuentra el dispositivo de audio que captura el sonido del sistema.
        En Windows, busca 'Stereo Mix' o 'What U Hear'.
        """
        print("\nBuscando dispositivos de audio disponibles...")
        dispositivos = []
        
        for i in range(self.audio.get_device_count()):
            info = self.audio.get_device_info_by_index(i)
            dispositivos.append((i, info['name'], info['maxInputChannels']))
            print(f"  [{i}] {info['name']} - Inputs: {info['maxInputChannels']}")
        
        # Buscar dispositivo loopback
        for i, nombre, inputs in dispositivos:
            nombre_lower = nombre.lower()
            if inputs > 0 and ('stereo mix' in nombre_lower or 
                             'what u hear' in nombre_lower or 
                             'loopback' in nombre_lower or
                             'salida' in nombre_lower):
                print(f"\n✓ Dispositivo encontrado: {nombre} (índice {i})")
                return i
        
        # Si no encuentra loopback, usar el dispositivo por defecto
        print("\n⚠ No se encontró dispositivo loopback específico.")
        print("Usando dispositivo de entrada por defecto.")
        print("NOTA: Para capturar audio del sistema, necesitas habilitar 'Stereo Mix' en Windows:")
        print("  1. Click derecho en el icono de sonido > Configuración de sonido")
        print("  2. Panel de control de sonido > Pestaña 'Grabación'")
        print("  3. Click derecho > Mostrar dispositivos deshabilitados")
        print("  4. Habilitar 'Stereo Mix'")
        
        return None
    
    def capturar_audio(self, device_index=None):
        """
        Captura audio del sistema en tiempo real.
        """
        if device_index is None:
            device_index = self.audio.get_default_input_device_info()['index']
        
        print(f"\nIniciando captura de audio desde dispositivo {device_index}...")
        print(f"Idioma origen: {self.idioma_origen}")
        print(f"Idioma destino: {self.idioma_destino}")
        print("Presiona Ctrl+C para detener.\n")
        
        stream = self.audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            input_device_index=device_index,
            frames_per_buffer=self.CHUNK
        )
        
        self.running = True
        
        # Hilo para procesar audio
        procesador = threading.Thread(target=self.procesar_audio, daemon=True)
        procesador.start()
        
        try:
            frames = []
            frame_count = 0
            frames_per_segment = int(self.RATE / self.CHUNK * self.RECORD_SECONDS)
            
            while self.running:
                data = stream.read(self.CHUNK, exception_on_overflow=False)
                frames.append(data)
                frame_count += 1
                
                # Cuando tengamos suficientes frames, agregar a la cola
                if frame_count >= frames_per_segment:
                    audio_data = b''.join(frames)
                    self.audio_queue.put(audio_data)
                    frames = []
                    frame_count = 0
                    
        except KeyboardInterrupt:
            print("\n\nDeteniendo captura...")
        finally:
            self.running = False
            stream.stop_stream()
            stream.close()
            self.audio.terminate()
    
    def procesar_audio(self):
        """
        Procesa los segmentos de audio: transcribe y traduce.
        """
        while self.running or not self.audio_queue.empty():
            try:
                # Obtener audio de la cola (con timeout)
                audio_data = self.audio_queue.get(timeout=1)
                
                # Convertir bytes a numpy array
                audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
                
                # Transcribir con Whisper
                resultado = self.model.transcribe(
                    audio_np,
                    language=None if self.idioma_origen == 'auto' else self.idioma_origen,
                    task='transcribe'
                )
                
                texto_original = resultado['text'].strip()
                
                if texto_original:
                    # Traducir texto
                    try:
                        texto_traducido = self.traductor.translate(texto_original)
                        
                        # Mostrar resultados
                        print(f"\n{'='*60}")
                        print(f"[ORIGINAL ({self.idioma_origen.upper()})]: {texto_original}")
                        print(f"[TRADUCCIÓN ({self.idioma_destino.upper()})]: {texto_traducido}")
                        print(f"{'='*60}\n")
                        
                    except Exception as e:
                        print(f"Error al traducir: {e}")
                        print(f"Texto original: {texto_original}")
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error procesando audio: {e}")
                continue
    
    def cerrar(self):
        """Cierra los recursos."""
        self.running = False
        if hasattr(self, 'audio'):
            self.audio.terminate()


def main():
    """Función principal."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Traduce en tiempo real el audio del sistema'
    )
    parser.add_argument(
        '--idioma-origen',
        default='es',
        help='Idioma del audio (ej: es, en, auto). Default: es'
    )
    parser.add_argument(
        '--idioma-destino',
        default='en',
        help='Idioma de destino (ej: en, es, fr). Default: en'
    )
    parser.add_argument(
        '--modelo',
        default='base',
        choices=['tiny', 'base', 'small', 'medium', 'large'],
        help='Modelo de Whisper a usar. Default: base'
    )
    parser.add_argument(
        '--dispositivo',
        type=int,
        default=None,
        help='Índice del dispositivo de audio a usar (opcional)'
    )
    
    args = parser.parse_args()
    
    # Crear traductor
    traductor = TraductorAudio(
        idioma_origen=args.idioma_origen,
        idioma_destino=args.idioma_destino,
        modelo_whisper=args.modelo
    )
    
    try:
        # Buscar dispositivo loopback si no se especificó uno
        device_index = args.dispositivo
        if device_index is None:
            device_index = traductor.encontrar_dispositivo_loopback()
        
        # Iniciar captura
        traductor.capturar_audio(device_index=device_index)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        traductor.cerrar()


if __name__ == '__main__':
    main()

