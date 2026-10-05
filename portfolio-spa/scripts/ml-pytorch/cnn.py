# Opcional: la misma convolución con PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa `imagen`, `filtros` y `convolucion` de la celda anterior.
try:
    import torch
    import torch.nn.functional as F
except (ImportError, OSError):  # OSError: PyTorch instalado pero roto (falta una biblioteca)
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    entrada = torch.tensor(imagen, dtype=torch.float32)[None, None]  # forma (lote, canal, alto, ancho)
    for nombre, k in filtros.items():
        filtro = torch.tensor(k, dtype=torch.float32)[None, None]
        mapa_pt = F.relu(F.conv2d(entrada, filtro))[0, 0].int().numpy()
        igual = (mapa_pt == np.maximum(convolucion(imagen, k), 0)).all()
        print(f"Filtro {nombre}: ¿PyTorch da el mismo mapa que la versión a mano? {igual}")
