import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    strictPort: false,
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://167.71.220.214:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
