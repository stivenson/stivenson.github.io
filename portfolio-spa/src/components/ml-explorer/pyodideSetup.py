# Se ejecuta una vez al cargar Pyodide en el worker.
# plt.show() no tiene pantalla en el worker: se anula, y _collect_figs()
# convierte cada figura abierta en un PNG en base64 (separados por \n).
import io, base64
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as plt
plt.style.use("dark_background")
plt.show = lambda *args, **kwargs: None


def _collect_figs():
    try:
        images = []
        for num in plt.get_fignums():
            buf = io.BytesIO()
            plt.figure(num).savefig(buf, format="png", dpi=110, bbox_inches="tight")
            images.append(base64.b64encode(buf.getvalue()).decode("ascii"))
        return "\n".join(images)
    finally:
        # Aunque savefig falle (p. ej. un titulo con LaTeX invalido), no
        # quedan figuras abiertas para la siguiente ejecucion.
        plt.close("all")
