"""Ejecuta los ejercicios del explorador de ML y compara su salida.

Cada ejercicio vive en src/components/ml-explorer/algorithms/python/<slug>.py
y su salida esperada en <slug>.out.txt. El explorador muestra esa salida
esperada aunque Python no cargue en el navegador, así que debe coincidir con
lo que imprime el código de verdad.

Uso (desde portfolio-spa/), con un Python que tenga las mismas versiones que
Pyodide 0.27.7 (numpy 2.0.2, scikit-learn 1.6.1, matplotlib 3.8.4, scipy 1.14.1):

    ~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py           # verifica
    ~/.cache/mlx-venv/bin/python scripts/check-ml-exercises.py --update  # regenera
"""
import os
import subprocess
import sys
from pathlib import Path

TIMEOUT = 120  # segundos por ejercicio
PY_DIR = Path(__file__).resolve().parent.parent / "src/components/ml-explorer/algorithms/python"


def main() -> None:
    update = "--update" in sys.argv
    env = {**os.environ, "MPLBACKEND": "Agg", "PYTHONIOENCODING": "utf-8", "PYTHONWARNINGS": "ignore"}
    failed = []
    scripts = sorted(PY_DIR.glob("*.py"))
    if not scripts:
        print(f"No hay ejercicios en {PY_DIR}")
    for script in scripts:
        try:
            # Bytes y decodificación a mano: text=True convertiría '\r\n' en
            # '\n', y la comparación debe ser exacta con lo que ve el navegador.
            run = subprocess.run(
                [sys.executable, str(script)],
                capture_output=True,
                env=env,
                timeout=TIMEOUT,
            )
        except subprocess.TimeoutExpired:
            print(f"✗ {script.name}: tardó más de {TIMEOUT} s")
            failed.append(script.name)
            continue
        if run.returncode != 0:
            print(f"✗ {script.name} falló:\n{run.stderr.decode('utf-8', errors='replace')}")
            failed.append(script.name)
            continue
        out = run.stdout.decode("utf-8", errors="replace").rstrip("\n")
        expected_path = script.with_suffix(".out.txt")
        if update:
            expected_path.write_bytes((out + "\n").encode("utf-8"))
            print(f"↻ {expected_path.name}")
            continue
        if not expected_path.exists():
            print(f"✗ {script.name}: falta {expected_path.name}")
            failed.append(script.name)
            continue
        expected = expected_path.read_bytes().decode("utf-8").rstrip("\n")
        if out == expected:
            print(f"✓ {script.name}")
        else:
            print(f"✗ {script.name}: la salida no coincide con {expected_path.name}")
            failed.append(script.name)
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
