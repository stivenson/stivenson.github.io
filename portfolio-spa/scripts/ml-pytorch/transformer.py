# Opcional: la misma atención con PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa `emb` y `atencion` de la celda anterior.
try:
    import torch
except (ImportError, OSError):  # OSError: PyTorch instalado pero roto (falta una biblioteca)
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    frase = ["el", "banco", "del", "río"]
    X_pt = torch.tensor([emb[p] for p in frase], dtype=torch.float64)
    pesos_pt = torch.softmax(X_pt @ X_pt.T / X_pt.shape[1] ** 0.5, dim=-1)
    salida_pt = torch.nn.functional.scaled_dot_product_attention(X_pt[None], X_pt[None], X_pt[None])[0]
    A, salida = atencion(frase)
    print(f"¿Mismos pesos que NumPy? {np.allclose(pesos_pt.numpy(), A)}")
    print(f"¿Misma salida con scaled_dot_product_attention? {np.allclose(salida_pt.numpy(), salida)}")
