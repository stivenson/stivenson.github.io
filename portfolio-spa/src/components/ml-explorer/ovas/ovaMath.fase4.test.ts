import { describe, expect, it } from 'vitest';
import {
  conv2d,
  fitLinearAutoencoder,
  maxPool2,
  mlpForward,
  mlpHits,
  positionalEncoding,
  reconstructionError,
  relu,
  rnnInfluence,
  rnnStates,
  selfAttention,
  softmax,
  symmetricEigen,
  type Mlp2,
} from './ovaMath';

describe('MLP 2-2-1', () => {
  it('con todos los pesos en 0, cada neurona vale 0.5', () => {
    const zero: Mlp2 = { h1: [0, 0, 0], h2: [0, 0, 0], out: [0, 0, 0] };
    expect(mlpForward(zero, { x: 3, y: -2 })).toEqual({ h: [0.5, 0.5], y: 0.5 });
  });

  it('«o» + «no-y» + «y» resuelve XOR en las cuatro esquinas', () => {
    const net: Mlp2 = { h1: [20, 20, -10], h2: [-20, -20, 30], out: [20, 20, -30] };
    const corners = [
      { x: 0, y: 0, label: 0 as const },
      { x: 0, y: 1, label: 1 as const },
      { x: 1, y: 0, label: 1 as const },
      { x: 1, y: 1, label: 0 as const },
    ];
    expect(corners.map((p) => Math.round(mlpForward(net, p).y))).toEqual([0, 1, 1, 0]);
    expect(mlpHits(net, corners)).toBe(4);
  });

  it('mlpHits: una salida de exactamente 0.5 cuenta como clase 1 (≥ 0.5)', () => {
    const zero: Mlp2 = { h1: [0, 0, 0], h2: [0, 0, 0], out: [0, 0, 0] };
    expect(mlpHits(zero, [{ x: 1, y: 1, label: 1 }])).toBe(1);
    expect(mlpHits(zero, [{ x: 1, y: 1, label: 0 }])).toBe(0);
  });
});

describe('convolución, ReLU y max pooling', () => {
  it('conv2d suma los productos de la ventana, sin voltear el filtro', () => {
    const img = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(conv2d(img, [[1, 0], [0, -1]])).toEqual([
      [-4, -4],
      [-4, -4],
    ]);
    expect(conv2d(img, [[0, 1], [0, 0]])).toEqual([
      [2, 3],
      [5, 6],
    ]);
  });

  it('relu deja los positivos y pone en 0 los negativos', () => {
    expect(relu([[-2, 0, 3]])).toEqual([[0, 0, 3]]);
  });

  it('maxPool2 se queda con el máximo de cada bloque de 2×2', () => {
    const m = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => 4 * i + j + 1));
    expect(maxPool2(m)).toEqual([
      [6, 8],
      [14, 16],
    ]);
  });
});

describe('RNN de una neurona', () => {
  it('rnnStates empieza en h_0 = 0 y aplica tanh(w·h + u·x)', () => {
    const h = rnnStates([1, 0], 0.5, 2);
    expect(h[0]).toBe(0);
    expect(h[1]).toBeCloseTo(Math.tanh(2), 15);
    expect(h[2]).toBeCloseTo(Math.tanh(0.5 * Math.tanh(2)), 15);
  });

  it('rnnInfluence coincide con la derivada numérica', () => {
    const xs = [0.3, -0.8, 0.5, 0.1];
    const [w, u, eps] = [0.7, 0.9, 1e-6];
    const last = (seq: number[]) => rnnStates(seq, w, u).at(-1)!;
    const g = rnnInfluence(xs, w, u);
    xs.forEach((_, t) => {
      const moved = xs.map((v, i) => (i === t ? v + eps : v));
      expect(g[t]).toBeCloseTo((last(moved) - last(xs)) / eps, 6);
    });
  });

  it('con h = 0 todo el tiempo, cada paso hacia atrás multiplica por w', () => {
    expect(rnnInfluence([0, 0, 0], 0.5, 1)).toEqual([0.25, 0.5, 1]);
  });
});

describe('atención', () => {
  it('softmax suma 1 e ignora los −∞', () => {
    const p = softmax([0, Math.log(3)]);
    expect(p[0]).toBeCloseTo(0.25, 15);
    expect(p[1]).toBeCloseTo(0.75, 15);
    expect(softmax([1, -Infinity])).toEqual([1, 0]);
  });

  it('positionalEncoding: seno en columnas pares, coseno en impares', () => {
    const pe = positionalEncoding(2, 4);
    expect(pe[0]).toEqual([0, 1, 0, 1]);
    expect(pe[1][0]).toBeCloseTo(Math.sin(1), 15);
    expect(pe[1][1]).toBeCloseTo(Math.cos(1), 15);
    expect(pe[1][2]).toBeCloseTo(Math.sin(0.01), 15);
    expect(pe[1][3]).toBeCloseTo(Math.cos(0.01), 15);
  });

  it('selfAttention: tokens idénticos se reparten la atención; con máscara causal el primero solo se ve a sí mismo', () => {
    const X = [
      [1, 0],
      [1, 0],
    ];
    expect(selfAttention(X).weights).toEqual([
      [0.5, 0.5],
      [0.5, 0.5],
    ]);
    const causal = selfAttention([[1, 0], [0, 1], [1, 1]], true);
    expect(causal.weights[0]).toEqual([1, 0, 0]);
    expect(causal.weights[1][2]).toBe(0);
    expect(causal.out[0]).toEqual([1, 0]);
  });

  it('sin codificación posicional, cambiar el orden solo cambia el orden de la salida', () => {
    const X = [[1, 0, 0], [0, 1, 1], [0.5, 0, 2]];
    const a = selfAttention(X).out;
    const b = selfAttention([X[2], X[0], X[1]]).out;
    [0, 1, 2].forEach((c) => {
      expect(b[1][c]).toBeCloseTo(a[0][c], 14);
      expect(b[2][c]).toBeCloseTo(a[1][c], 14);
      expect(b[0][c]).toBeCloseTo(a[2][c], 14);
    });
  });
});

describe('autoencoder lineal', () => {
  it('symmetricEigen: autovalores de mayor a menor y A·v = λ·v', () => {
    const { values } = symmetricEigen([[2, 1], [1, 2]]);
    expect(values[0]).toBeCloseTo(3, 12);
    expect(values[1]).toBeCloseTo(1, 12);
    const S = [
      [4, 1, 0.5],
      [1, 3, 0.2],
      [0.5, 0.2, 1],
    ];
    const e = symmetricEigen(S);
    e.vectors.forEach((v, j) => {
      S.forEach((row, i) => expect(row.reduce((s, a, k) => s + a * v[k], 0)).toBeCloseTo(e.values[j] * v[i], 10));
    });
  });

  it('symmetricEigen: la tolerancia es relativa; una matriz a escala 1e10 converge en pocos barridos', () => {
    const S = [
      [4, 1, 0.5],
      [1, 3, 0.2],
      [0.5, 0.2, 1],
    ].map((r) => r.map((a) => a * 1e10));
    const e = symmetricEigen(S);
    expect(e.sweeps).toBeLessThan(15);
    e.vectors.forEach((v, j) => {
      S.forEach((row, i) =>
        expect(row.reduce((s, a, k) => s + a * v[k], 0) / 1e10).toBeCloseTo((e.values[j] * v[i]) / 1e10, 8),
      );
    });
  });

  it('datos sobre una recta: con k = 1 se reconstruyen sin error; un punto fuera de la recta, no', () => {
    const X = [0, 1, 2, 3, 4].map((t) => [t, 2 * t, -t]);
    const ae = fitLinearAutoencoder(X, 1);
    for (const x of X) expect(reconstructionError(ae, x)).toBeCloseTo(0, 20);
    expect(reconstructionError(ae, [1, 0, 0])).toBeGreaterThan(0.1);
  });
});
