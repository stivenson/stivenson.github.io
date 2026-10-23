# Opcional: ejemplo no lineal independiente; requiere la celda NumPy anterior.
# Se informa validación, sin volver a mirar la prueba final del ejercicio.
try:
    import torch
    from torch import nn
except (ImportError, OSError):
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    torch.manual_seed(0)
    X_pt = torch.tensor(entreno, dtype=torch.float32)
    modelo = nn.Sequential(
        nn.Linear(6, 4), nn.Tanh(), nn.Linear(4, 2),
        nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 6),
    )
    opt = torch.optim.Adam(modelo.parameters(), lr=0.01, weight_decay=0.0)
    for _ in range(2000):  # lote completo: una actualización por época
        opt.zero_grad()
        perdida = ((modelo(X_pt) - X_pt) ** 2).mean()
        perdida.backward()
        opt.step()
    modelo.eval()
    def errores_pt(datos):
        with torch.no_grad():
            X = torch.tensor(datos, dtype=torch.float32)
            return ((modelo(X) - X) ** 2).mean(dim=1)
    limite = torch.quantile(errores_pt(calibracion), 0.95)
    n, f = errores_pt(val_normal), errores_pt(val_fraude)
    print(f"PyTorch, validación: falsas alarmas {(n > limite).sum().item()}/{len(n)}; fraudes señalados {(f > limite).sum().item()}/{len(f)}")
