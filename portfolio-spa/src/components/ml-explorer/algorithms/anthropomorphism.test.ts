/**
 * Sin antropomorfizar: ningún texto visible del explorador dice que un modelo «entiende»,
 * «sabe», «piensa», «comprende», «razona» o «cree». Un modelo calcula pesos y probabilidades.
 *
 * Recorre, para cada algoritmo disponible: las 8 pestañas (essential y deepDive), la fila del
 * cheatsheet, la OVA renderizada (hint, controles y readout iniciales) y «En tu área»; y además
 * todas las fichas del glosario.
 *
 * Detecta un sujeto que sea un modelo (modelo, red, algoritmo, Transformer, BERT, GPT, ChatGPT,
 * LLM, IA, simulador, máquina) seguido, a lo sumo dos palabras después, de uno de esos verbos;
 * y la forma impersonal «sirve para entender/comprender».
 *
 * Lista blanca (ALLOWED): frases exactas que el detector marcaría pero que no atribuyen mente a
 * un modelo. Hoy está vacía; si se añade una, se documenta aquí el porqué.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GLOSSARY } from '../glossary';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { TAB_IDS } from '../types';
import { proseText } from './visibleText';

const SUBJECT = String.raw`(?:modelos?|red(?:es)?|algoritmos?|transformers?|bert|gpt|chatgpt|llms?|ia|simulador|máquinas?)`;
const VERB = String.raw`(?:entiende|sabe|piensa|comprende|razona|cree)n?`;
const PATTERNS: RegExp[] = [
  new RegExp(String.raw`(?<![\p{L}])${SUBJECT}(?:\s+[\p{L},]+){0,2}?\s+${VERB}(?![\p{L}])`, 'giu'),
  /sirven? para (?:entender|comprender)/giu,
];

/** Frases que el detector marcaría sin que sean antropomorfismo (vacía a propósito). */
const ALLOWED: string[] = [];

function findAnthropomorphisms(text: string): string[] {
  const hits: string[] = [];
  for (const re of PATTERNS) {
    for (const m of text.matchAll(re)) {
      if (!ALLOWED.some((a) => m[0].toLowerCase() === a.toLowerCase())) hits.push(m[0]);
    }
  }
  return hits;
}

describe('findAnthropomorphisms', () => {
  it('detecta los verbos vetados aplicados a modelos y deja pasar a las personas', () => {
    expect(findAnthropomorphisms('El modelo entiende la frase.')).toHaveLength(1);
    expect(findAnthropomorphisms('la red ya sabe que es un 7')).toHaveLength(1);
    expect(findAnthropomorphisms('ChatGPT piensa antes de responder')).toHaveLength(1);
    expect(findAnthropomorphisms('BERT sirve para entender texto')).toHaveLength(1);
    expect(findAnthropomorphisms('para entender cuánto pesa cada variable')).toHaveLength(0);
    expect(findAnthropomorphisms('nadie sabe por qué')).toHaveLength(0);
    expect(findAnthropomorphisms('la redacción sabe bien')).toHaveLength(0);
  });
});

describe('ningún texto visible antropomorfiza a un modelo', () => {
  for (const slug of AVAILABLE_SLUGS) {
    it(slug, async () => {
      const mod = await loadAlgorithm(slug);
      const problems: string[] = [];
      const check = (where: string, text: string) => {
        for (const h of findAnthropomorphisms(text)) problems.push(`${where}: «${h}»`);
      };
      for (const tab of TAB_IDS) {
        for (const part of ['essential', 'deepDive'] as const) {
          const node = mod.tabs[tab][part];
          if (node != null) check(`${tab}/${part}`, proseText(renderToStaticMarkup(node as never)));
        }
      }
      check('fila', Object.values(mod.row).join('\n'));
      check('OVA', proseText(renderToStaticMarkup(createElement(mod.Ova))));
      for (const f of mod.inYourField ?? []) check(`En tu área (${f.area})`, f.example);
      expect(problems).toEqual([]);
    });
  }

  it('glosario', () => {
    const problems: string[] = [];
    for (const [k, e] of Object.entries(GLOSSARY)) {
      for (const h of findAnthropomorphisms(Object.values(e).filter((v) => typeof v === 'string').join('\n'))) {
        problems.push(`${k}: «${h}»`);
      }
    }
    expect(problems).toEqual([]);
  });
});
