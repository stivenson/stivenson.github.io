import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export interface OvaPlayback {
  step: number;
  last: number;
  playing: boolean;
  reducedMotion: boolean;
  speed: number;
  repeat: boolean;
  toggle: () => void;
  previous: () => void;
  next: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  setRepeat: (repeat: boolean) => void;
}

/**
 * Controla una secuencia mientras está visible. Al terminar se queda quieta,
 * salvo que el lector active la repetición. Navegar a mano cancela el temporizador.
 * Con movimiento reducido muestra el resultado y permite recorrer pasos a mano.
 */
export function useAutoLoop(
  step: number,
  last: number,
  setStep: Dispatch<SetStateAction<number>>,
  visible: boolean,
  reducedMotion: boolean,
  enabled: boolean,
  intervalMs = 850,
  pauseAtEndMs = 1100,
  pauseAtStepMs?: (step: number, last: number) => number | undefined,
) : OvaPlayback {
  const [playing, setPlaying] = useState(enabled && !reducedMotion);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const current = Math.min(step, last);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPlaying(false);
      if (enabled) setStep(last);
    }
  }, [reducedMotion, enabled, last, setStep]);

  useEffect(() => {
    if (!playing || reducedMotion || last === 0) return;
    if (current >= last && !repeat) {
      setPlaying(false);
      return;
    }
    if (!visible || !pageVisible) return;

    const atEnd = step >= last;
    const stepPause = pauseAtStepMs?.(step, last);
    const id = window.setTimeout(
      () => setStep((current) => (current >= last ? 0 : current + 1)),
      (stepPause ?? (atEnd ? pauseAtEndMs : Math.max(800, intervalMs))) / speed,
    );
    return () => window.clearTimeout(id);
  }, [step, current, last, setStep, visible, pageVisible, reducedMotion, playing, repeat, speed, intervalMs, pauseAtEndMs, pauseAtStepMs]);

  const move = (value: number) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(last, value)));
  };
  return {
    step: current, last, playing: playing && !reducedMotion && last > 0,
    reducedMotion, speed, repeat, setSpeed, setRepeat,
    toggle: () => {
      if (reducedMotion || last === 0) return;
      if (!playing && current >= last) setStep(0);
      setPlaying((value) => !value);
    },
    previous: () => move(current - 1),
    next: () => move(current + 1),
    restart: () => move(0),
  };
}
