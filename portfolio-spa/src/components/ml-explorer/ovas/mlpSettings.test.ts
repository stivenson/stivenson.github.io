import { expect, it } from 'vitest';
import reference from './mlp-reference.json';
import { XOR_POINTS } from './datasets';
import { mlpForward, type MlpActivation, type Mlp2 } from './ovaMath';

for(const c of reference.cases) it(`propagación independiente ${c.activation}, ${JSON.stringify(c.net)}`, () => {
  XOR_POINTS.forEach((p,i) => {
    const got=mlpForward(c.net as Mlp2,p,c.activation as MlpActivation);
    expect(got.h[0]).toBeCloseTo(c.hidden[i][0],10);
    expect(got.h[1]).toBeCloseTo(c.hidden[i][1],10);
    expect(got.y).toBeCloseTo(c.outputs[i],10);
  });
});
it('sin transformación oculta se mantiene una función afín seguida de sigmoide', () => {
  const net: Mlp2={h1:[1,2,3],h2:[-2,1,-1],out:[2,3,.5]};
  const logit=(p:{x:number,y:number})=> { const y=mlpForward(net,p,'identity').y; return Math.log(y/(1-y)); };
  const p={x:.1,y:.2},q={x:.3,y:-.2};
  expect(logit({x:(p.x+q.x)/2,y:(p.y+q.y)/2})).toBeCloseTo((logit(p)+logit(q))/2,8);
});
