import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/coingecko/proxy': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path, req) => {
          // Extract the ?p= value and use it as the real path
          const u = new URL(path, 'http://localhost')
          return decodeURIComponent(u.searchParams.get('p') || '/')
        },
        headers: { Accept: 'application/json' },
      },
      '/api/feargreed/proxy': {
        target: 'https://api.alternative.me',
        changeOrigin: true,
        rewrite: (path) => {
          const u = new URL(path, 'http://localhost')
          return decodeURIComponent(u.searchParams.get('p') || '/fng/?limit=1')
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
