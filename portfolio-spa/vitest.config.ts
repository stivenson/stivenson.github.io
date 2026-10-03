import { defineConfig } from 'vitest/config';

// Por defecto los tests corren en node (logica pura: estado de URL, loader,
// cliente de Pyodide, matematica de las OVAs, render en servidor). Los tests
// de componentes con DOM viven en *.dom.test.tsx y piden jsdom con el
// comentario `// @vitest-environment jsdom` en su primera linea.
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
