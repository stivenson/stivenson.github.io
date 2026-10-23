import { expect, it } from 'vitest';
import reference from './dbscan-reference.json';
import { DB_POINTS } from './datasets';
import { dbscan, type DbscanMetric } from './ovaMath';

for(const c of reference.cases) it(`sklearn: ${c.metric}, eps=${c.eps}, min_samples=${c.minSamples}`, () => {
  const r=dbscan(DB_POINTS,c.eps,c.minSamples,c.metric as DbscanMetric);
  expect(r.labels).toEqual(c.labels);
  expect(r.core.flatMap((core,i)=>core ? [i] : [])).toEqual(c.cores);
});
it('min_samples incluye al propio punto y el límite eps es inclusivo', () => {
  const points=[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:7,y:0}];
  const r=dbscan(points,1,3);
  expect(r.core).toEqual([false,true,false,false]);
  expect(r.labels).toEqual([0,0,0,-1]);
});
it('eps limita vecinos, no el diámetro del grupo', () => {
  const points=Array.from({length:6},(_,x)=>({x,y:0}));
  expect(dbscan(points,1,2).labels).toEqual([0,0,0,0,0,0]);
});
it('un borde compartido no conecta dos grupos de núcleos', () => {
  const points=[{x:-1.8,y:0},{x:-1.8,y:.1},{x:-1.8,y:-.1},{x:-.9,y:0}, {x:0,y:0}, {x:.9,y:0},{x:1.8,y:0},{x:1.8,y:.1},{x:1.8,y:-.1}];
  const r=dbscan(points,1,4);
  expect(r.clusters).toBe(2); expect(r.core[4]).toBe(false);
  expect(r.labels[4]).toBe(r.labels[0]);
});
