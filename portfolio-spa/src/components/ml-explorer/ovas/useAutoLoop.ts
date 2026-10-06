import { useEffect, type Dispatch, type SetStateAction } from 'react';

/**
 * Reproduce una secuencia en bucle mientras la OVA está visible.
 * No expone controles de reproducción: solo el algoritmo decide el avance.
 * Con movimiento reducido, deja el resultado final quieto.
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
) {
  useEffect(() => {
    if (!enabled) return;
    if (reducedMotion) {
      if (step !== last) setStep(last);
      return;
    }
    if (!visible) return;

    const atEnd = step >= last;
    const id = window.setTimeout(
      () => setStep((current) => (current >= last ? 0 : current + 1)),
      atEnd ? pauseAtEndMs : intervalMs,
    );
    return () => window.clearTimeout(id);
  }, [step, last, setStep, visible, reducedMotion, enabled, intervalMs, pauseAtEndMs]);
}
