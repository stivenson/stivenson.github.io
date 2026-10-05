# Opcional: la misma medición con una RNN de PyTorch y su derivada automática (autograd).
# Colab ya trae PyTorch; en el navegador no corre. Usa `x` y `u` de la celda anterior.
try:
    import torch
except (ImportError, OSError):  # OSError: PyTorch instalado pero roto (falta una biblioteca)
    print("PyTorch no está instalado: esta celda es opcional.")
else:
    red_pt = torch.nn.RNN(1, 1, bias=False, dtype=torch.float64)  # h_t = tanh(u·x_t + w·h_(t−1))
    with torch.no_grad():
        red_pt.weight_ih_l0.fill_(u)
        red_pt.weight_hh_l0.fill_(0.9)
    entrada = torch.tensor(x[:10]).reshape(10, 1, 1).requires_grad_()
    salidas, _ = red_pt(entrada)
    salidas[-1].sum().backward()  # retropropagación en el tiempo, hecha por PyTorch
    print(f"PyTorch con T = 10, w = 0.9: ∂h_T/∂x_1 = {entrada.grad[0].item():.4f}")
