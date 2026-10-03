import { defineConfig } from 'vitest/config';

// Solo la logica pura del explorador tiene tests (estado de URL, loader,
// cliente de Pyodide, matematica de las OVAs). Los componentes se verifican
// en el navegador.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
