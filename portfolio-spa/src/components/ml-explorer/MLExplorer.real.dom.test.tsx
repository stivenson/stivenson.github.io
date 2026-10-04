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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="group"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle.is-draggable')).toHaveLength(9);
      expect(container.querySelector('.katex')).not.toBeNull();
    }
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(18);
      expect(screen.getByText(/^Aciertos:/).textContent).toContain('15 de 18');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(28);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toMatch(/^2 reglas/);
      expect(container.querySelector('.mlx-tabpanel ul.mlx-tree')).not.toBeNull();
      expect(container.querySelector('.katex')).not.toBeNull();
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="group"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('rect.is-draggable[role="button"]')).toHaveLength(1);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Predicción: 🔵 no le gustó');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(28);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('acierta 35 de 40');
      expect(container.querySelector('.katex')).not.toBeNull();
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(21);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('2.41');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle[r="6"]')).toHaveLength(22);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Ancho del margen: 2.13');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
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

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel input[type="text"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('P(positiva) = 93 %');
      expect(container.querySelector('.katex')).not.toBeNull();
    }
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

    if (id === 'formula') {
      expect(container.querySelector('.mlx-tabpanel svg[role="img"]')).not.toBeNull();
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('2 grupos y 4 puntos de ruido');
      expect(container.querySelector('.katex')).not.toBeNull();
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

    if (id === 'formula') {
      const svg = container.querySelector('.mlx-tabpanel svg[role="img"]');
      expect(svg).not.toBeNull();
      expect(svg!.querySelectorAll('circle')).toHaveLength(24);
      expect(container.querySelector('.mlx-tabpanel [role="status"]')?.textContent).toContain('Inercia: 294.05');
      expect(container.querySelector('.katex')).not.toBeNull();
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
