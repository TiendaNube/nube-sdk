import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import * as path from 'node:path'

import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          panel: 'panel.html',
        },
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
          manualChunks(id) {
            if (id.includes('react-syntax-highlighter') || id.includes('refractor') || id.includes('prismjs')) {
              return 'syntax-highlighter'
            }
            if (id.includes('react-dom')) {
              return 'react-vendor'
            }
          },
        },
      },
    },
    plugins: [crx({ manifest }), react()],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
