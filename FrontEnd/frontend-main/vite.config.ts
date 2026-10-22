import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    // En desarrollo, /api se envía al borde (Caddy -> APISIX), igual que en
    // QA: la web nunca habla con un servicio directamente.
    proxy: {
      '/api': {
        target: process.env.REDVITAL_BORDE ?? 'https://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
