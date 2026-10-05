# Opcional: un autoencoder no lineal en PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa `normales` y `fraudes` de la celda anterior. Sus cifras no tienen por qué coincidir con las del lineal.
try:
    import torch
    from torch import nn
except (ImportError, OSError):  # OSError: PyTorch instalado pero roto (falta una biblioteca)
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    torch.manual_seed(0)
    N_pt = torch.tensor(normales, dtype=torch.float32)
    F_pt = torch.tensor(fraudes, dtype=torch.float32)
    modelo = nn.Sequential(  # 6 → 4 → 2 (cuello de botella) → 4 → 6
        nn.Linear(6, 4), nn.Tanh(), nn.Linear(4, 2),
        nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 6),
    )
    opt = torch.optim.Adam(modelo.parameters(), lr=0.01)
    for _ in range(2000):
        opt.zero_grad()
        perdida = ((modelo(N_pt) - N_pt) ** 2).mean()
        perdida.backward()
        opt.step()
    with torch.no_grad():
        e_norm = ((modelo(N_pt) - N_pt) ** 2).mean(dim=1)
        e_fraude = ((modelo(F_pt) - F_pt) ** 2).mean(dim=1)
    umbral = torch.quantile(e_norm, 0.99)
    print(f"PyTorch, cuello de 2: detecta {(e_fraude > umbral).sum().item()} de {len(F_pt)} fraudes")
