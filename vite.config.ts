import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const buildTimestamp = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __PWA_BUILD_TIME__: JSON.stringify(buildTimestamp),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    open: false,
  },
});

