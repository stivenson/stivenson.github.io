import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assetsDir = resolve(__dirname, '../../assets');
const indexPath = resolve(__dirname, '../../index.html');

try {
  console.log('🔍 Buscando archivos en:', assetsDir);
  console.log('📄 Actualizando:', indexPath);
  
  // Buscar los archivos más recientes
  const files = readdirSync(assetsDir);
  console.log(`📁 Total de archivos encontrados: ${files.length}`);
  
  const jsFiles = files
    .filter(f => f.startsWith('index-') && f.endsWith('.js'))
    .map(f => ({
      name: f,
      time: statSync(resolve(assetsDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  const cssFiles = files
    .filter(f => f.startsWith('index-') && f.endsWith('.css'))
    .map(f => ({
      name: f,
      time: statSync(resolve(assetsDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  console.log(`📦 Archivos JS encontrados: ${jsFiles.length}`);
  console.log(`🎨 Archivos CSS encontrados: ${cssFiles.length}`);
  
  if (jsFiles.length === 0 && cssFiles.length === 0) {
    console.log('⚠️ No se encontraron archivos para actualizar');
    process.exit(0);
  }

  let html = readFileSync(indexPath, 'utf-8');
  let updated = false;
  
  // Actualizar referencias JS
  if (jsFiles.length > 0) {
    const latestJs = jsFiles[0].name;
    const newScript = `<script type="module" crossorigin src="./assets/${latestJs}"></script>`;
    const oldScriptMatch = html.match(/<script[^>]*src="[^"]*index-[^"]*\.js"[^>]*><\/script>/);
    
    if (oldScriptMatch && !oldScriptMatch[0].includes(latestJs)) {
      html = html.replace(
        /<script[^>]*src="[^"]*index-[^"]*\.js"[^>]*><\/script>/,
        newScript
      );
      console.log(`✅ Actualizado JS: ${latestJs}`);
      updated = true;
    }
  }
  
  // Actualizar referencias CSS
  if (cssFiles.length > 0) {
    const latestCss = cssFiles[0].name;
    const newLink = `<link rel="stylesheet" crossorigin href="./assets/${latestCss}">`;
    const oldLinkMatch = html.match(/<link[^>]*href="[^"]*index-[^"]*\.css"[^>]*>/);
    
    if (oldLinkMatch && !oldLinkMatch[0].includes(latestCss)) {
      html = html.replace(
        /<link[^>]*href="[^"]*index-[^"]*\.css"[^>]*>/,
        newLink
      );
      console.log(`✅ Actualizado CSS: ${latestCss}`);
      updated = true;
    }
  }
  
  if (updated) {
    writeFileSync(indexPath, html, 'utf-8');
    console.log('✅ index.html actualizado exitosamente');
  } else {
    console.log('ℹ️ index.html ya está actualizado');
  }
} catch (error) {
  console.error('❌ Error actualizando index.html:', error.message);
  process.exit(1);
}
