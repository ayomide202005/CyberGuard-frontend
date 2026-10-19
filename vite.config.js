import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Any request starting with /api is forwarded to our Node backend
      '/api': 'https://cyberguard-backend-d4ip.onrender.com/',
    },
  },
})