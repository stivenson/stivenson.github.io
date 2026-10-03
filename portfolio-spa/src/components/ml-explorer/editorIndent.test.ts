import { describe, expect, it } from 'vitest';
import { indent, outdent } from './editorIndent';

describe('indent', () => {
  it('cursor simple: inserta 4 espacios y deja el cursor tras ellos', () => {
    expect(indent('ab', 1, 1)).toEqual({ code: 'a    b', selectionStart: 5, selectionEnd: 5 });
  });

  it('selección dentro de una línea: la reemplaza por 4 espacios', () => {
    expect(indent('abcd', 1, 3)).toEqual({ code: 'a    d', selectionStart: 5, selectionEnd: 5 });
  });

  it('3 líneas completas: indenta cada una y ajusta la selección', () => {
    expect(indent('a\nb\nc', 0, 5)).toEqual({
      code: '    a\n    b\n    c',
      selectionStart: 4,
      selectionEnd: 17,
    });
  });

  it('selección que empieza a mitad de línea indenta la línea entera', () => {
    expect(indent('ab\ncd', 1, 4)).toEqual({ code: '    ab\n    cd', selectionStart: 5, selectionEnd: 12 });
  });

  it('si la selección termina al inicio de una línea, esa línea no se indenta', () => {
    expect(indent('a\nb\nc', 0, 4)).toEqual({ code: '    a\n    b\nc', selectionStart: 4, selectionEnd: 12 });
  });
});

describe('outdent', () => {
  it('quita 4 espacios', () => {
    expect(outdent('    a', 4, 4)).toEqual({ code: 'a', selectionStart: 0, selectionEnd: 0 });
  });

  it('quita solo 2 si hay 2', () => {
    expect(outdent('  a', 3, 3)).toEqual({ code: 'a', selectionStart: 1, selectionEnd: 1 });
  });

  it('con 0 espacios no cambia nada', () => {
    expect(outdent('a', 1, 1)).toEqual({ code: 'a', selectionStart: 1, selectionEnd: 1 });
  });

  it('sin selección actúa sobre la línea del cursor', () => {
    expect(outdent('x\n    y\nz', 7, 7)).toEqual({ code: 'x\ny\nz', selectionStart: 3, selectionEnd: 3 });
  });

  it('varias líneas: ajusta la selección sin pasar del inicio de su línea', () => {
    expect(outdent('    a\n  b\nc', 2, 11)).toEqual({ code: 'a\nb\nc', selectionStart: 0, selectionEnd: 5 });
  });
});
