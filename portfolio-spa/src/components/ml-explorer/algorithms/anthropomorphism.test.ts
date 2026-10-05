/**
 * Sin antropomorfizar: ningún texto visible del explorador dice que un modelo «entiende»,
 * «sabe», «piensa», «comprende», «razona» o «cree». Un modelo calcula pesos y probabilidades.
 *
 * Recorre, para cada algoritmo disponible: las 8 pestañas (essential y deepDive), la fila del
 * cheatsheet, la OVA renderizada (hint, controles y readout iniciales) y «En tu área»; y además
 * todas las fichas del glosario.
 *
 * Detecta, dentro de una misma línea, un sujeto que sea un modelo (modelo, red, algoritmo, Transformer, BERT, GPT, ChatGPT,
 * LLM, IA, simulador, máquina) seguido, a lo sumo cuatro palabras después, de uno de esos verbos
 * en cualquier tiempo (raíces entend/entiend, comprend, razon, piens/pensó/pensaba (no «pensada», que es «diseñada»), sab, supo/supe,
 * cree/creía/creyó), también entre comillas («entiende») y en infinitivo tras «puede», «capaz de» o
 * «aprende a» (caben en la ventana de cuatro palabras); y la forma impersonal «sirve para
 * entender/comprender».
 *
 * También marca las negaciones: «ChatGPT no sabe» se detecta a propósito; un texto que niegue la
 * mente de un modelo debe decirlo sin esos verbos («no consulta», «no tiene acceso»).
 *
 * Límites conocidos: no ve el verbo antes del sujeto («¿Sabe el modelo?») ni sujetos separados
 * por más de cuatro palabras, ni sinónimos («conoce»).
 *
 * Lista blanca (ALLOWED): frases exactas que el detector marcaría pero que no atribuyen mente a
 * un modelo (falsos positivos como «la red sabe bien», del sabor). Si se añade una, se documenta
 * aquí el porqué.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GLOSSARY } from '../glossary';
import { AVAILABLE_SLUGS, loadAlgorithm } from '../registry';
import { TAB_IDS } from '../types';
import { proseText } from './visibleText';

const SUBJECT = String.raw`(?:modelos?|red(?:es)?|algoritmos?|transformers?|bert|gpt|chatgpt|llms?|ia|simulador|máquinas?)`;
const VERB = String.raw`(?:(?:entend|entiend|comprend|razon|piens|sab)\p{L}*|pens(?:ó|ar|aron|aba|aban)|sup[oe]|cre(?:en?|ía|ían|yó|yeron))`;
const PATTERNS: RegExp[] = [
  new RegExp(String.raw`(?<![\p{L}])${SUBJECT}(?:[ \t,]+\p{L}+){0,4}?[ \t,]+[«"“]?${VERB}(?![\p{L}])`, 'giu'),
  /sirven? para (?:entender|comprender)/giu,
];

/** Frases que el detector marcaría sin que sean antropomorfismo. */
const ALLOWED: string[] = ['la red sabe bien'];

function findAnthropomorphisms(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: { start: number; end: number; s: string }[] = [];
  for (const re of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      const s = m[0].toLowerCase();
      // Permitida si el texto contiene una frase de ALLOWED que incluye lo detectado.
      if (ALLOWED.some((a) => a.includes(s) && lower.includes(a))) continue;
      // Un mismo trozo detectado por dos patrones cuenta una vez.
      if (hits.some((h) => start < h.end && h.start < end)) continue;
      hits.push({ start, end, s: m[0] });
    }
  }
  return hits.map((h) => h.s);
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

  it('atrapa las mutaciones del revisor: tiempos, comillas, ventana de cuatro palabras e infinitivos', () => {
    for (const s of [
      'la IA entiende',
      'ChatGPT sabe',
      'Los modelos de lenguaje entienden',
      'el modelo puede entender el texto',
      'la red entendió el patrón',
      'el modelo sabía la respuesta',
      'ChatGPT no sabe nada',
      'el modelo de lenguaje grande ya entiende',
      'la IA «entiende»',
      'un LLM capaz de razonar',
      'el modelo cree que',
      'el Transformer comprende',
      'la máquina piensa',
      'el modelo aprende a entender',
      'el modelo realmente sabe',
      'la red neuronal profunda sabe',
      'la IA que sabe',
      'la red no lo sabe',
      'sirve para comprender',
      'el modelo razonó',
      'el modelo pensó',
      'la red supo',
    ]) {
      expect(findAnthropomorphisms(s), s).toHaveLength(1);
    }
  });

  it('deja pasar falsos positivos conocidos y verbos parecidos', () => {
    for (const s of ['nadie sabe si la red', 'la red sabe bien', 'el modelo supone que', 'el modelo superior', 'el modelo crea grupos']) {
      expect(findAnthropomorphisms(s), s).toHaveLength(0);
    }
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
