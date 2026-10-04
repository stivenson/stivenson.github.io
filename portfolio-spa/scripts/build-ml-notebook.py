"""Genera notebooks/algoritmos-ml.ipynb con los ejercicios del explorador.

Genera el notebook completo y, además, uno por algoritmo en
notebooks/algoritmos-ml/<slug>.ipynb (el botón «Abrir en Colab» de cada
ejercicio abre el suyo). Es el mismo código que corre en el navegador con
Pyodide. No borra notebooks de algoritmos que no estén en la lista.

Uso (desde portfolio-spa/):  python3 scripts/build-ml-notebook.py
"""
import json
from pathlib import Path

SPA = Path(__file__).resolve().parent.parent
PY_DIR = SPA / "src/components/ml-explorer/algorithms/python"
OUT = SPA.parent / "notebooks/algoritmos-ml.ipynb"
OUT_DIR = SPA.parent / "notebooks/algoritmos-ml"
ARTICLE = "https://stivenson.github.io/#/articles/algoritmos-ml-explorador"

# Mismo orden que el menú del explorador. Cada fase agrega sus algoritmos.
ALGORITHMS: list[tuple[str, str, str]] = [
    (
        "linear-regression",
        "Linear Regression (regresión lineal)",
        "Precio de casas: ¿cuánto suma cada m² y cada habitación?",
    ),
    (
        "logistic-regression",
        "Logistic Regression (regresión logística)",
        "Detector de spam: probabilidad de que un correo sea spam según tres señales.",
    ),
    (
        "decision-tree",
        "Decision Tree (árbol de decisión)",
        "¿Pagará el préstamo? Un árbol que se lee como reglas, y qué le pasa cuando crece demasiado.",
    ),
    (
        "random-forest",
        "Random Forest (bosque aleatorio)",
        "Detector de fraude: un árbol solo contra un bosque de 100, y qué señales pesan de verdad.",
    ),
    (
        "gradient-boosting",
        "Gradient Boosting (potenciación por gradiente)",
        "Scoring de crédito: cada árbol corrige al anterior. La curva de pérdida dice cuándo parar.",
    ),
    (
        "knn",
        "KNN (k vecinos más cercanos)",
        "Recomendador: qué película ver según lo que les gustó a los usuarios más parecidos.",
    ),
]


def lines(text: str) -> list[str]:
    return text.splitlines(keepends=True)


def markdown(text: str, cell_id: str) -> dict:
    return {"cell_type": "markdown", "id": cell_id, "metadata": {}, "source": lines(text)}


def code(text: str, cell_id: str) -> dict:
    return {
        "cell_type": "code",
        "id": cell_id,
        "metadata": {},
        "execution_count": None,
        "outputs": [],
        "source": lines(text),
    }


def wrap(cells: list[dict]) -> dict:
    return {
        "cells": cells,
        "metadata": {
            "colab": {"provenance": []},
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def write(path: Path, notebook: dict) -> None:
    path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cells = [
        markdown(
            "# Algoritmos de machine learning: ejercicios\n\n"
            "Un ejercicio breve por algoritmo, con datos de juguete y semilla fija para que el resultado se pueda repetir.\n\n"
            f"Explicación, fórmulas y simuladores en el artículo: {ARTICLE}\n\n"
            "Ejecuta las celdas en orden con **Entorno de ejecución → Ejecutar todas**. No hace falta GPU.",
            "intro",
        )
    ]
    for slug, title, summary in ALGORITHMS:
        cells.append(
            markdown(
                f"## {title}\n\n{summary}\n\n[Abrir en el explorador]({ARTICLE}?alg={slug}&tab=realWorld)",
                slug,
            )
        )
        cells.append(code((PY_DIR / f"{slug}.py").read_text(encoding="utf-8").rstrip("\n"), f"{slug}-codigo"))

    write(OUT, wrap(cells))
    for slug, title, summary in ALGORITHMS:
        source = (PY_DIR / f"{slug}.py").read_text(encoding="utf-8").rstrip("\n")
        single = [
            markdown(
                f"# {title}\n\n{summary}\n\n[Abrir en el explorador]({ARTICLE}?alg={slug}&tab=realWorld)\n\n"
                "Ejecuta la celda de abajo (no hace falta GPU).",
                "intro",
            ),
            code(source, f"{slug}-codigo"),
        ]
        write(OUT_DIR / f"{slug}.ipynb", wrap(single))
    print(f"Escrito {OUT.relative_to(SPA.parent)} y {len(ALGORITHMS)} notebooks individuales")


if __name__ == "__main__":
    main()
