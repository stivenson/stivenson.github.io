// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KnnOva } from './KnnOva';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const setK = (v: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(v) } });

describe('KnnOva', () => {
  it('con k = 1 decide el vecino de ruido («no le gustó»); con k = 3, «le gustó»', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<KnnOva />);
    expect(status(container)).toContain('Votos: 🔵 no le gustó 1 · 🟠 le gustó 0');
    expect(status(container)).toContain('Predicción: 🔵 no le gustó');

    setK(3);
    expect(status(container)).toContain('Votos: 🔵 no le gustó 1 · 🟠 le gustó 2');
    expect(status(container)).toContain('Predicción: 🟠 le gustó');
    expect(error).not.toHaveBeenCalled();
  });

  it('el rombo es un botón enfocable que se mueve con las flechas (Shift: paso 1), con redondeo', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<KnnOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('group');

    const diamond = screen.getByRole('button', { name: /^Persona nueva: acción 6.4, ciencia ficción 7\./ });
    expect(diamond.getAttribute('aria-roledescription')).toBe('punto movible');
    diamond.focus();
    expect(document.activeElement).toBe(diamond);
    const x0 = diamond.getAttribute('x');

    fireEvent.keyDown(diamond, { key: 'ArrowRight' });
    const moved = screen.getByRole('button', { name: /^Persona nueva: acción 6.65, ciencia ficción 7\./ });
    expect(moved.getAttribute('x')).not.toBe(x0);

    // 0.65 + 0.25 · 3 = 7.4 exacto gracias al redondeo (sin él saldría 7.3999…).
    for (let i = 0; i < 3; i++) fireEvent.keyDown(moved, { key: 'ArrowRight' });
    screen.getByRole('button', { name: /^Persona nueva: acción 7.4, ciencia ficción 7\./ });

    fireEvent.keyDown(moved, { key: 'ArrowDown', shiftKey: true });
    screen.getByRole('button', { name: /^Persona nueva: acción 7.4, ciencia ficción 6\./ });

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }));
    screen.getByRole('button', { name: /^Persona nueva: acción 6.4, ciencia ficción 7\./ });
    expect(error).not.toHaveBeenCalled();
  });

  it('la explicación de k = 1 va fuera del readout (role="status")', () => {
    const { container } = render(<KnnOva />);
    const text = screen.getByText(/Con k = 1 decide un solo vecino/);
    expect(container.querySelector('[role="status"]')?.contains(text)).toBe(false);
    expect(status(container)).not.toContain('Con k = 1 decide');
  });
});
