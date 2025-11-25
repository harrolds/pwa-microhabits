import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': resolve(__dirname, 'src/app'),
      '@pwa': resolve(__dirname, 'src/pwa')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'service-worker.ts')
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'sw' ? 'service-worker.js' : 'assets/[name]-[hash].js'
      }
    }
  }
})

