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

describe('texto que empieza con línea en blanco', () => {
  it('outdent con el cursor en la línea vacía inicial no toca la línea siguiente', () => {
    expect(outdent('\n    x', 0, 0)).toEqual({ code: '\n    x', selectionStart: 0, selectionEnd: 0 });
  });

  it('indent indenta también la línea vacía inicial', () => {
    expect(indent('\nab', 0, 3)).toEqual({ code: '    \n    ab', selectionStart: 4, selectionEnd: 11 });
  });

  it('indent de un solo salto de línea seleccionado', () => {
    expect(indent('\n', 0, 1)).toEqual({ code: '    \n', selectionStart: 4, selectionEnd: 5 });
  });
});

describe('outdent', () => {
  it('un tab al inicio cuenta como un nivel', () => {
    expect(outdent('\ta\n\t\tb', 0, 6)).toEqual({ code: 'a\n\tb', selectionStart: 0, selectionEnd: 4 });
  });

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

describe('propiedades (exhaustivo en textos cortos)', () => {
  const alphabet = ['a', ' ', '\n', '\t'];
  const texts: string[] = [''];
  for (let i = 0; i < texts.length; i++) {
    if (texts[i].length < 5) for (const c of alphabet) texts.push(texts[i] + c);
  }
  const keep = (t: string) => t.replace(/[ \t]/g, '');
  const stripLeading = (t: string) => t.replace(/^ +/gm, '');

  for (const [name, fn] of [['indent', indent], ['outdent', outdent]] as const) {
    it(`${name}: selección válida y no se pierde texto`, () => {
      for (const code of texts) {
        for (let s = 0; s <= code.length; s++) {
          for (let e = s; e <= code.length; e++) {
            const r = fn(code, s, e);
            const ctx = JSON.stringify({ code, s, e, r });
            expect(r.selectionStart >= 0 && r.selectionStart <= r.selectionEnd && r.selectionEnd <= r.code.length, ctx).toBe(true);
            // Diseño: Tab con selección sin saltos de línea la reemplaza por 4 espacios.
            const replaced = name === 'indent' && !code.slice(s, e).includes('\n');
            const before = replaced ? code.slice(0, s) + code.slice(e) : code;
            expect(keep(r.code), ctx).toBe(keep(before));
            if (name === 'outdent') {
              // Líneas tocadas por la selección, calculadas aparte de la implementación.
              const lineOf = (pos: number) => code.slice(0, pos).split('\n').length - 1;
              const last = e > s && code[e - 1] === '\n' ? e - 1 : e;
              const [firstLine, lastLine] = [lineOf(s), lineOf(last)];
              const before = code.split('\n');
              const after = r.code.split('\n');
              expect(after.length, ctx).toBe(before.length);
              before.forEach((line, i) => {
                if (i < firstLine || i > lastLine) {
                  expect(after[i], ctx).toBe(line);
                } else {
                  expect(line.endsWith(after[i]), ctx).toBe(true);
                  expect(line.slice(0, line.length - after[i].length), ctx).toMatch(/^[ \t]*$/);
                }
              });
            }
            if (name === 'indent' && !replaced) {
              expect(stripLeading(r.code.slice(r.selectionStart, r.selectionEnd)), ctx).toBe(stripLeading(code.slice(s, e)));
            }
          }
        }
      }
    });
  }
});
