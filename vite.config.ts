import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['process'],
  },
  build: {
    outDir: 'build' // ここが 'dist' になっている可能性大
  }
})
