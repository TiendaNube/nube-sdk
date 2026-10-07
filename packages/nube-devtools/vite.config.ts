import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import * as path from 'node:path'

import manifest from './src/manifest'

const browser = process.env.BROWSER === 'firefox' ? 'firefox' : 'chrome'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: browser === 'firefox' ? 'build-firefox' : 'build',
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          panel: 'panel.html',
        },
      },
    },
    plugins: [crx({ manifest, browser }), react()],
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
