// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SvmOva } from './SvmOva';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./useMotion', () => ({ useInViewport: () => true, usePrefersReducedMotion: () => motion.reduced }));

afterEach(() => {
  motion.reduced = false;
  cleanup();
  vi.restoreAllMocks();
});

const status = (c: HTMLElement) => c.querySelector('.mlx-ova-readout')?.textContent ?? '';
const setC = (i: number) => fireEvent.change(screen.getByRole('slider'), { target: { value: String(i) } });
const rings = (c: HTMLElement) => c.querySelectorAll('svg circle[r="10"]').length;
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Siguiente paso' }));
const advance = (steps: number) => {
  for (let i = 0; i < steps; i++) next();
};

describe('SvmOva', () => {
  it('lineal: C pequeño → margen ancho y muchos vectores de soporte; C grande → margen estrecho', () => {
    const error = vi.spyOn(console, 'error');
    const { container } = render(<SvmOva />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('1');
    expect(status(container)).toContain('Puntos observados: 22');

    advance(1);
    expect(status(container)).toContain('Vectores de soporte: 17 de 22');
    expect(status(container)).toContain('Ancho del margen: 7.03');

    advance(2);
    expect(status(container)).toContain('Vectores de soporte: 5 de 22');
    expect(status(container)).toContain('acierta 21 de 22 puntos');
    expect(status(container)).toContain('Ancho del margen: 2.13');
    expect(rings(container)).toBe(5);

    setC(4);
    advance(5);
    expect(status(container)).toContain('Vectores de soporte: 4 de 22');
    expect(status(container)).toContain('acierta 21 de 22 puntos');
    expect(status(container)).toContain('Ancho del margen: 1.94');
    expect(error).not.toHaveBeenCalled();
  });

  it('RBF con C = 10 rodea el punto raro y acierta los 22; con C = 1 lo deja pasar', () => {
    const { container } = render(<SvmOva />);
    fireEvent.click(screen.getByRole('button', { name: 'RBF (curvo)' }));
    expect(screen.getByRole('button', { name: 'RBF (curvo)' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('Configuración elegida').textContent).toContain('gamma = 0.3');
    advance(3);
    expect(status(container)).toContain('Vectores de soporte: 19 de 22');
    expect(status(container)).toContain('acierta 21 de 22 puntos');
    expect(status(container)).not.toContain('margen');

    setC(3);
    advance(4);
    expect(status(container)).toContain('Vectores de soporte: 14 de 22');
    expect(status(container)).toContain('acierta 22 de 22 puntos');

    fireEvent.click(screen.getByRole('button', { name: 'Lineal' }));
    advance(3);
    expect(status(container)).toContain('Ancho del margen: 2.13');
  });

  it('el svg es una imagen con 22 puntos y 1024 celdas; el hint va fuera del readout', () => {
    const { container } = render(<SvmOva />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.querySelectorAll('circle[r="6"]')).toHaveLength(22);
    expect(svg?.querySelectorAll('rect')).toHaveLength(1024);
    const hint = screen.getByText(/La franja oscura es la zona de margen/);
    expect(container.querySelector('[role="status"]')?.contains(hint)).toBe(false);
    expect(hint.textContent).toContain('en RBF no mide una distancia uniforme');
  });

  it('hace visible la frontera verde y explica C en el paso actual', () => {
    const { container } = render(<SvmOva />);
    next();
    expect(container.querySelectorAll('.mlx-svm-cell.is-boundary').length).toBeGreaterThan(0);
    expect(status(container)).toContain('C bajo tolera más errores');
    expect(screen.getByText(/Configuración 1 de 3/).textContent).toContain('C = 0.01');
  });
  it('compara C y gamma directamente con el ajuste elegido y restaura', () => {
    const { container } = render(<SvmOva />);
    const gamma = screen.getByRole('combobox', { name: 'Influencia local en RBF (gamma)' });
    expect(gamma.hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar ajuste elegido' }));
    expect(status(container)).toContain('Ancho del margen: 2.13');
    expect(screen.queryByRole('button', { name: 'Siguiente paso' })).toBeNull();
    setC(4);
    expect(status(container)).toContain('Ancho del margen: 1.94');
    fireEvent.click(screen.getByRole('button', { name: 'RBF (curvo)' }));
    expect(gamma.hasAttribute('disabled')).toBe(false);
    const colors = () => [...container.querySelectorAll('svg rect')].map(e => e.getAttribute('fill'));
    fireEvent.change(gamma, { target: { value: '0.03' } });
    const wide = colors();
    fireEvent.change(gamma, { target: { value: '3' } });
    expect(colors()).not.toEqual(wide);
    expect(screen.getByLabelText('Configuración elegida').textContent).toContain('gamma = 3');
    expect(status(container)).not.toContain('Ancho del margen');
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes' }));
    expect(gamma.hasAttribute('disabled')).toBe(true);
    expect((gamma as HTMLSelectElement).value).toBe('0.3');
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('1');
    expect(screen.getByText('Sin ajustar')).toBeTruthy();
  });
  it('abre la ficha de C y devuelve el foco al cerrar', () => {
    render(<SvmOva />);
    const trigger = screen.getByRole('button', { name: /^C/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'C (en SVM)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(document.activeElement).toBe(trigger);
  });

  it('con movimiento reducido muestra el C elegido sin reproducción automática', () => {
    motion.reduced = true;
    const { container } = render(<SvmOva autoPlay />);
    expect(status(container)).toContain('Ancho del margen: 2.13');
    expect(screen.queryByRole('button', { name: /Pausar/ })).toBeNull();
    setC(4);
    expect(status(container)).toContain('Ancho del margen: 1.94');
  });

  it('con gamma alto no pinta de verde zonas lejanas con puntaje casi cero', () => {
    const { container } = render(<SvmOva />);
    fireEvent.click(screen.getByRole('button', { name: 'RBF (curvo)' }));
    setC(4);
    fireEvent.change(screen.getByRole('combobox', { name: 'Influencia local en RBF (gamma)' }), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar ajuste elegido' }));
    const cells = container.querySelectorAll('svg rect');
    expect(cells[0].classList.contains('is-boundary')).toBe(false);
    expect(container.querySelectorAll('.mlx-svm-cell.is-boundary').length).toBeGreaterThan(0);
  });

});
