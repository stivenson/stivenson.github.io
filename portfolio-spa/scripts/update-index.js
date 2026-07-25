import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const indexPath = resolve(root, 'index.html');

// NOTE: Vite regenerates index.html on every build (outDir = repo root),
// wiring the correct hashed entry chunk + modulepreloads. This script used
// to rewrite the <script>/<link> tags by picking the "newest index-*.js by
// mtime" — which BREAKS with multi-chunk output (there can be several
// index-*.js and it could wire a non-entry chunk). It no longer mutates
// anything; it just verifies that every asset index.html references exists
// on disk, so a broken deploy fails loudly instead of shipping a white page.
try {
  const html = readFileSync(indexPath, 'utf-8');
  const refs = [...html.matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g)].map((m) => m[1]);

  console.log(`🔎 index.html referencia ${refs.length} asset(s):`);
  refs.forEach((r) => console.log(`   • ${r}`));

  const missing = refs.filter((r) => !existsSync(resolve(root, r)));
  if (missing.length) {
    console.error('❌ Assets referenciados que NO existen en disco:');
    missing.forEach((m) => console.error(`   • ${m}`));
    console.error('   El build de vite no quedó consistente. Aborta el deploy.');
    process.exit(1);
  }

  console.log('✅ index.html OK — todos los assets referenciados existen (generado por vite).');
} catch (error) {
  console.error('❌ Error verificando index.html:', error.message);
  process.exit(1);
}
