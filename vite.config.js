import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyRewrite = (defaultPath) => (path) => {
  const u = new URL(path, 'http://localhost')
  return decodeURIComponent(u.searchParams.get('p') || defaultPath)
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/coingecko/proxy': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: proxyRewrite('/'),
        headers: { Accept: 'application/json' },
      },
      '/api/binance/proxy': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: proxyRewrite('/api/v3/ping'),
      },
      '/api/feargreed/proxy': {
        target: 'https://api.alternative.me',
        changeOrigin: true,
        rewrite: proxyRewrite('/fng/?limit=1'),
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
