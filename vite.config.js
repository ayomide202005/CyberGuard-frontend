import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Only used on your own computer (npm run dev).
      // Any request starting with /api is forwarded to our local Node backend.
      // On Vercel, the same job is done by vercel.json.
      '/api': 'http://localhost:5000',
    },
  },
})