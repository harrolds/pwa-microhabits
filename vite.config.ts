import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sw: path.resolve(__dirname, 'service-worker.ts')
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'sw' ? 'service-worker.js' : 'assets/[name]-[hash].js'
      }
    }
  }
});

