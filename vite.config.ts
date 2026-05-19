import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['clay-shop.ru', 'www.clay-shop.ru', 'store-backend.cloudpub.ru', 'bosozoku-shop.cloudpub.ru'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },

  },
  plugins: [react()]
});