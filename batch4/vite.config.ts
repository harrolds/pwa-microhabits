import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins:[react()],
  build:{
    rollupOptions:{
      input:{
        main: resolve(__dirname,'index.html'),
        sw: resolve(__dirname,'service-worker.ts')
      },
      output:{
        entryFileNames: asset => asset.name==='service-worker' ? 'service-worker.js' : 'assets/[name]-[hash].js'
      }
    }
  }
})
