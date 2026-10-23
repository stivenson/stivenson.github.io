// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import reference from './autoencoders-reference.json';
import { AutoencoderOva, aeExperiment } from './AutoencoderOva';
import { AE_NORMAL, AE_FRAUD } from './datasets';
import { fitLinearAutoencoder, reconstructionError } from './ovaMath';
afterEach(cleanup);
const status = (c: HTMLElement) => c.querySelector('[role="status"]')?.textContent ?? '';
const change = (name: string, value: number) => fireEvent.change(screen.getByRole('slider', {name}), {target:{value:String(value)}});

describe('AutoencoderOva', () => {
  it('coincide con SVD y percentiles de NumPy en 18 configuraciones', () => {
    for(const c of reference.cases) {
      const got=aeExperiment(c.k,c.percentile);
      expect(got.threshold).toBeCloseTo(c.threshold,9);
      got.normal.forEach((v,i)=>expect(v).toBeCloseTo(c.normal[i],9));
      got.fraud.forEach((v,i)=>expect(v).toBeCloseTo(c.fraud[i],9));
    }
  });
  it('separa entrenamiento, calibración y comprobación; interpola el percentil', () => {
    const {model,normal,fraud,threshold}=aeExperiment(2,95);
    expect(model).toEqual(fitLinearAutoencoder(AE_NORMAL.slice(0,24),2));
    const cal=AE_NORMAL.slice(24,32).map(x=>reconstructionError(model,x)).sort((a,b)=>a-b);
    expect(threshold).toBeCloseTo(cal[6]+(cal[7]-cal[6])*0.65,12);
    expect(normal).toEqual(AE_NORMAL.slice(32).map(x=>reconstructionError(model,x)));
    expect(fraud).toEqual(AE_FRAUD.map(x=>reconstructionError(model,x)));
  });
  it('el percentil mueve solo el umbral y nunca aumenta las alarmas', () => {
    for(let k=1;k<=6;k++) {
      const low=aeExperiment(k,80), high=aeExperiment(k,99);
      expect(high.model).toEqual(low.model);
      expect(high.normal).toEqual(low.normal);
      expect(high.fraud).toEqual(low.fraud);
      expect(high.threshold).toBeGreaterThanOrEqual(low.threshold);
      const alarms=(e:typeof low)=>[...e.normal,...e.fraud].filter(x=>x>e.threshold+1e-9).length;
      expect(alarms(high)).toBeLessThanOrEqual(alarms(low));
    }
  });
  it('revela por etapas, conserva el resultado final al cambiar ajustes y restaura', () => {
    const {container}=render(<AutoencoderOva/>);
    expect(status(container)).not.toContain('Fraudes señalados:');
    fireEvent.click(screen.getByRole('checkbox',{name:'Mostrar resultado final'}));
    expect(status(container)).toContain('Fraudes señalados:');
    expect(status(container)).toContain('Falsas alarmas:');
    const svg=screen.getByRole('img',{name:/Errores de reconstrucción/});
    expect(svg.querySelectorAll('.mlx-ae-bar')).toHaveLength(11);
    expect(svg.querySelectorAll('.is-fraud')).toHaveLength(3);
    change('Tamaño del cuello (k)',6);
    expect(status(container)).toContain('Fraudes señalados: 0 de 3');
    expect(status(container)).toContain('Falsas alarmas: 0 de 8');
    expect(status(container)).toContain('Sin cuello de botella');
    change('Percentil de calibración',80);
    expect(screen.getByLabelText('Configuración elegida').textContent).toContain('percentil 80');
    fireEvent.click(screen.getByRole('button',{name:'Restablecer ejemplo'}));
    expect(screen.getByRole('slider',{name:'Tamaño del cuello (k)'}).getAttribute('value')).toBe('2');
    expect(screen.getByRole('slider',{name:'Percentil de calibración'}).getAttribute('value')).toBe('95');
  });
});
