import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/chat': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
      '/call': 'http://localhost:8080'
    }
  }
})
