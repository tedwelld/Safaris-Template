import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api/bokun': process.env.BOKUN_PROXY_TARGET || 'http://localhost:3001' } },
})
