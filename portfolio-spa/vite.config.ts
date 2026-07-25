import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildStamp()],
  base: './',
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
        }
      }
    }
  }
})

