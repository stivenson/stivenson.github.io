// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PythonRunner } from './PythonRunner';

let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error');
});
afterEach(() => {
  expect(errorSpy).not.toHaveBeenCalled();
  cleanup();
  vi.restoreAllMocks();
});

const exercise = { code: 'x = 1\nprint(x)', expectedOutput: '1', colabAnchor: 'a' };
const setup = () => {
  const { container } = render(<PythonRunner exercise={exercise} />);
  const ta = screen.getByLabelText('Código Python editable') as HTMLTextAreaElement;
  const pre = container.querySelector('.mlx-py-hl pre') as HTMLPreElement;
  return { ta, pre };
};

describe('PythonRunner: editor coloreado', () => {
  it('escribir en el textarea actualiza el pre coloreado', () => {
    const { ta, pre } = setup();
    fireEvent.change(ta, { target: { value: 'def f():\n    return 2' } });
    expect(pre.textContent).toBe('def f():\n    return 2\n');
    const tokens = [...pre.querySelectorAll<HTMLElement>('span.token')];
    const color = (t: string) => tokens.find((n) => n.textContent === t)?.style.color;
    // keywords con el azul de vscDarkPlus (#569CD6)
    expect(color('def')).toBe('rgb(86, 156, 214)');
    expect(color('return')).toBe('rgb(86, 156, 214)');
  });

  it('el scroll del textarea se copia al pre', () => {
    const { ta, pre } = setup();
    ta.scrollTop = 40;
    ta.scrollLeft = 25;
    fireEvent.scroll(ta);
    expect(pre.scrollTop).toBe(40);
    expect(pre.scrollLeft).toBe(25);
  });

  it('Tab sigue indentando y el pre lo refleja', () => {
    const { ta, pre } = setup();
    ta.setSelectionRange(0, 0);
    fireEvent.keyDown(ta, { key: 'Tab' });
    expect(ta.value.startsWith('    x = 1')).toBe(true);
    expect(pre.textContent).toBe(ta.value + '\n');
  });
});
