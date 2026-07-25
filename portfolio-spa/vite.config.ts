import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

