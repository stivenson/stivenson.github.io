import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Repo root: one level above this Vite root (portfolio-spa/).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Stamps the build timestamp into index.html so the deployed page always
// carries the current build date (visible in <head>, aids cache debugging).
function buildStamp(): Plugin {
  return {
    name: 'build-stamp',
    transformIndexHtml(html) {
      const date = new Date().toISOString()
      return html.replace('</head>', `  <meta name="build-date" content="${date}" />\n  </head>`)
    },
  }
}

// Serves the repo-root static folders (OVAs and their assets) during `vite dev`.
//
// Those files live outside this Vite root, so the dev server cannot find them
// and answers with the SPA's index.html instead. An <iframe src="/ovas/x.html">
// then loads the article *inside itself*, recursively, and the container that
// measures the iframe keeps growing forever. In production the files sit next
// to index.html at the repo root, so only dev needs this.
function serveRootStatic(): Plugin {
  const roots = ['/ovas/', '/notebooks/']
  return {
    name: 'serve-root-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (!roots.some((prefix) => url.startsWith(prefix))) return next()

        // No '..' may escape the repo root.
        const target = path.resolve(repoRoot, '.' + decodeURIComponent(url))
        if (!target.startsWith(repoRoot) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
          return next()
        }

        const types: Record<string, string> = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'text/javascript; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.ipynb': 'application/json; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
        }
        res.setHeader('Content-Type', types[path.extname(target).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(target).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildStamp(), serveRootStatic()],
  base: './',
  // rehype-katex trae su propia copia de KaTeX (0.16) y el explorador usa la
  // 0.18: sin dedupe salen las dos (~600 KB cada una). Además la hoja de
  // estilos que se carga es la de la 0.18.
  resolve: {
    dedupe: ['katex'],
  },
  // El worker de Pyodide hace import() de una URL del CDN: necesita salir
  // como modulo ES (el formato iife por defecto no admite import dinamico).
  worker: {
    format: 'es',
  },
  build: {
    outDir: '../',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Split always-loaded core into stable, cacheable chunks.
          // Article-only deps (markdown, syntax-highlighter) are left to
          // rollup so they land in the lazily-loaded ArticleDetail chunk.
          if (/[\\/]react-router|[\\/]react-dom|[\\/]scheduler|[\\/]react[\\/]/.test(id)) return 'react-vendor'
          if (id.includes('framer-motion')) return 'framer'
          // KaTeX: compartido por los artículos (rehype-katex) y el explorador ML.
          if (/[\\/]katex[\\/]/.test(id)) return 'katex'
        }
      }
    }
  }
})

