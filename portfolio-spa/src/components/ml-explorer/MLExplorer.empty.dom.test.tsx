// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { MLExplorer } from './MLExplorer';

// Registry sin ningún algoritmo disponible (como en main antes de la fase 1).
vi.mock('./registry', async () => {
  const fake = await import('./testRegistry');
  return {
    ...fake,
    ALGORITHMS: fake.ALGORITHMS.map((a) => ({ ...a, available: false })),
    AVAILABLE_SLUGS: [],
  };
});

afterEach(cleanup);

it('sin algoritmos disponibles muestra un aviso en vez de romper', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = render(
    <MemoryRouter initialEntries={['/articles/x?alg=alpha']}>
      <MLExplorer />
    </MemoryRouter>,
  );
  expect(screen.getByText('Pronto: los algoritmos están en camino.')).toBeTruthy();
  expect(container.querySelector('.mlx-boot')).not.toBeNull();
  expect(error).not.toHaveBeenCalled();
  error.mockRestore();
});
