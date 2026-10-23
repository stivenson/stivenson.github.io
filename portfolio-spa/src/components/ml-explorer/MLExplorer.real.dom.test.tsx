// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MLExplorer } from './MLExplorer';
import { TAB_IDS, TAB_LABELS } from './types';

// Sin mock del registry: monta el explorador con los algoritmos reales y
// descarga sus chunks de verdad (KaTeX, OVA, ejercicio).

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('Linear Regression real: carga su chunk y recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Linear Regression' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="group"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle.is-draggable')).toHaveLength(9);
      expect(screen.getByRole('group', { name: 'Datos y visualización' })).toBeTruthy();
    }
    if (id === 'formula') expect(container.querySelector('.katex')).not.toBeNull();
  }

  expect(error).not.toHaveBeenCalled();
});

it('Logistic Regression real (?alg=logistic-regression): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=logistic-regression']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Logistic Regression' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar ajuste final' }));
      expect(container.querySelectorAll('.mlx-logistic-point')).toHaveLength(18);
      expect(screen.getByRole('combobox', { name: /Regularización inversa/ })).toBeTruthy();
      const curve = container.querySelector('.mlx-logistic-curve')?.getAttribute('d');
      fireEvent.change(screen.getByRole('slider', { name: 'Umbral de spam' }), { target: { value: '0.8' } });
      expect(container.querySelector('.mlx-logistic-curve')?.getAttribute('d')).toBe(curve);
      expect(container.querySelector('[role="status"]')?.textContent).toContain('spam que se escapan: 3');
    }
    if (id === 'formula') expect(container.querySelector('.katex')).not.toBeNull();
  }

  expect(error).not.toHaveBeenCalled();
});

it('Decision Tree real (?alg=decision-tree): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=decision-tree']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Decision Tree' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(28);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('clientes de entrenamiento');
      expect(container.querySelector('.mlx-tabpanel ul.mlx-tree')).not.toBeNull();
      expect(screen.getByRole('slider', { name: /min_samples_leaf/ })).toBeTruthy();
      expect(container.querySelector('.mlx-essential')?.textContent).toContain('ccp_alpha');
    }
  }

  expect(error).not.toHaveBeenCalled();
});

it('KNN real (?alg=knn): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=knn']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'KNN' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      expect(screen.getByRole('group', { name: 'Hiperparámetros de KNN' })).toBeTruthy();
      expect(container.querySelector('rect.is-draggable[role="button"]')).not.toBeNull();
    }
    if (id === 'formula') expect(container.querySelector('.katex')).not.toBeNull();
  }
  expect(error).not.toHaveBeenCalled();
});

it('Linear Regression real: en Ejemplo real el botón lleva a Logistic Regression', async () => {
  render(
    <MemoryRouter initialEntries={['/articles/x?alg=linear-regression&tab=realWorld']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  const btn = await screen.findByRole('button', { name: /^Siguiente algoritmo:/ }, { timeout: 10000 });
  expect(btn.textContent).toBe('Siguiente algoritmo: Logistic Regression →');
});

it('Random Forest real (?alg=random-forest): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=random-forest']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Random Forest' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(28);
      expect(screen.getByRole('slider', { name: /n_estimators/ })).toBeTruthy();
      expect(screen.getByRole('combobox', { name: /max_features/ })).toBeTruthy();
      expect(container.querySelector('.mlx-essential')?.textContent).toContain('bootstrap');
    }
  }

  expect(error).not.toHaveBeenCalled();
});

it('Gradient Boosting real (?alg=gradient-boosting): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=gradient-boosting']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Gradient Boosting' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(screen.getByRole('group', { name: 'Hiperparámetros de Gradient Boosting' })).toBeTruthy();
    }
    if (id === 'formula') expect(container.querySelector('.katex')).not.toBeNull();
  }
  expect(error).not.toHaveBeenCalled();
});

it('SVM real (?alg=svm): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=svm']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'SVM' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(screen.getByRole('group', { name: 'Hiperparámetros de SVM' })).toBeTruthy();
    }
    if (id === 'formula') expect(container.querySelector('.katex')).not.toBeNull();
  }
  expect(error).not.toHaveBeenCalled();
});

it('Naive Bayes real (?alg=naive-bayes): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=naive-bayes']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Naive Bayes' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      expect(container.querySelector('.mlx-tabpanel input[type="text"]')).not.toBeNull();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar resultado completo' }));
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('P(positiva) = 93 %');
      expect(screen.getByRole('slider', { name: /Suavizado/ })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: '3D' }));
      expect(container.querySelectorAll('.mlx-nb-3d-evidence')).toHaveLength(4);
    }
    if (id === 'formula') expect(container.querySelector('.katex')).not.toBeNull();
  }

  expect(error).not.toHaveBeenCalled();
});

it('DBSCAN real (?alg=dbscan): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=dbscan']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'DBSCAN' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(screen.getByRole('group', { name: 'Hiperparámetros de DBSCAN' })).toBeTruthy();

    }
  }

  expect(error).not.toHaveBeenCalled();
});

it('K-Means real (?alg=k-means): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=k-means']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'K-Means' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'type') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(24);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Inercia: 294.05');
      expect(screen.getByRole('group', { name: 'Hiperparámetros de K-Means' })).toBeTruthy();
    }
  }

  expect(error).not.toHaveBeenCalled();
});

it('Hierarchical Clustering real (?alg=hierarchical-clustering): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=hierarchical-clustering']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Hierarchical Clustering' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelectorAll('.mlx-tabpanel svg[role="img"]')).toHaveLength(2);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Corte en 3.0: 3 grupos');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});

it('PCA real (?alg=pca): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=pca']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'PCA' })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('captura 66.5 %');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
});

/** Recorre las 8 pestañas de un algoritmo real; en Fórmula comprueba la OVA (svg role="img"), su lectura y KaTeX. */
async function tourRealAlgorithm(slug: string, heading: string, readout: string) {
  const error = vi.spyOn(console, 'error');
  const { container } = render(
    <MemoryRouter initialEntries={[`/articles/x?alg=${slug}`]}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: heading })).toBeTruthy();
  await screen.findByRole('tab', { name: TAB_LABELS.formula }, { timeout: 10000 });

  for (const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab', { name: TAB_LABELS[id] }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe(TAB_LABELS[id]);
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent?.replace(/\s+/g, ' ')).toContain(readout);
      expect(container.querySelector('.katex')).not.toBeNull();
    }
  }

  expect(error).not.toHaveBeenCalled();
}

it('MLP real (?alg=mlp): recorre las 8 pestañas sin errores', async () => {
  const error = vi.spyOn(console, 'error');
  const {container}=render(<MemoryRouter initialEntries={['/articles/x?alg=mlp']}><MLExplorer /></MemoryRouter>);
  await screen.findByRole('tab', {name:TAB_LABELS.type}, {timeout:10000});
  for(const id of TAB_IDS) {
    fireEvent.click(screen.getByRole('tab',{name:TAB_LABELS[id]}));
    expect(container.querySelector('.mlx-essential')?.textContent?.trim()).toBeTruthy();
    if(id==='type') {
      expect(screen.getByRole('group',{name:'Hiperparámetro de activación MLP'})).toBeTruthy();
      fireEvent.click(screen.getByRole('checkbox',{name:'Mostrar salida completa'}));
      expect(container.querySelector('[role="status"]')?.textContent).toContain('20 de 20');
    }
    if(id==='formula') expect(container.querySelector('.katex')).not.toBeNull();
  }
  expect(error).not.toHaveBeenCalled();
});

it('CNN real (?alg=cnn): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('cnn', 'CNN', 'Suma de productos: 2 → tras ReLU: 2');
});

it('RNN real (?alg=rnn): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('rnn', 'RNN', 'Influencia de x₁ en la salida: 0.024 (1 en 41)');
});

it('Transformer real (?alg=transformer): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('transformer', 'Transformer (BERT, GPT)', 'dinero 0.41 · naturaleza 1.23');
});

it('Autoencoders real (?alg=autoencoders): recorre las 8 pestañas sin errores', async () => {
  await tourRealAlgorithm('autoencoders', 'Autoencoders', 'Fraudes detectados: 3 de 3');
});
