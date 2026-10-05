# Opcional: una red equivalente en PyTorch (Colab ya lo trae instalado; en el navegador no corre).
# Usa X_tr, X_te, y_tr, y_te de la celda anterior (el ejercicio): ejecútala antes.
# El acierto será parecido al de scikit-learn, no idéntico: cambian el sorteo de los pesos, el orden de los lotes
# y la penalización L2 (scikit-learn usa alpha=0.0001; aquí no hay ninguna).
try:
    import torch
    from torch import nn
except (ImportError, OSError):  # OSError: PyTorch instalado pero roto (falta una biblioteca)
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    torch.manual_seed(0)
    Xt, Xv = torch.tensor(X_tr, dtype=torch.float32), torch.tensor(X_te, dtype=torch.float32)
    yt, yv = torch.tensor(y_tr), torch.tensor(y_te)
    red_pt = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))
    opt = torch.optim.Adam(red_pt.parameters(), lr=0.001)
    for epoca in range(150):
        orden = torch.randperm(len(Xt))
        for i in range(0, len(Xt), 200):  # lotes de hasta 200 filas, como scikit-learn
            lote = orden[i:i + 200]
            opt.zero_grad()
            perdida = nn.functional.cross_entropy(red_pt(Xt[lote]), yt[lote])
            perdida.backward()
            opt.step()
    acierto = (red_pt(Xv).argmax(dim=1) == yv).float().mean().item()
    print(f"PyTorch, 32 neuronas ocultas: {acierto:.1%} en datos nuevos")
