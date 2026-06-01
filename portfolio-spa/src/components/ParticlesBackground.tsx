import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useReducedMotion } from 'framer-motion';
import type { ISourceOptions } from '@tsparticles/engine';

const PARTICLES_CONFIG_ANIMATED: ISourceOptions = {
  particles: {
    number: { value: 90 },
    color: { value: ['#4C59D3', '#55AAFF'] },
    opacity: { value: { min: 0.2, max: 0.55 } },
    size: { value: { min: 1.5, max: 3.5 } },
    move: { enable: true, speed: 0.5 },
    links: {
      enable: true,
      color: 'rgba(85,170,255,0.15)',
      distance: 130,
      opacity: 0.3,
    },
  },
  interactivity: {
    events: { onHover: { enable: true, mode: 'repulse' } },
    modes: { repulse: { distance: 80, duration: 0.4 } },
  },
  detectRetina: true,
};

const PARTICLES_CONFIG_STATIC: ISourceOptions = {
  particles: {
    number: { value: 90 },
    color: { value: ['#4C59D3', '#55AAFF'] },
    opacity: { value: { min: 0.2, max: 0.55 } },
    size: { value: { min: 1.5, max: 3.5 } },
    move: { enable: false },
    links: {
      enable: true,
      color: 'rgba(85,170,255,0.15)',
      distance: 130,
      opacity: 0.3,
    },
  },
  interactivity: {
    events: { onHover: { enable: false } },
  },
  detectRetina: true,
};

export function ParticlesBackground() {
  const reducedMotion = useReducedMotion();
  const [engineReady, setEngineReady] = useState(false);

  const init = useCallback(async () => {
    await initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
    setEngineReady(true);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  if (!engineReady) return null;

  return (
    <Particles
      id="tsparticles"
      options={reducedMotion ? PARTICLES_CONFIG_STATIC : PARTICLES_CONFIG_ANIMATED}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
