import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 4000,
  },
  watch: {
    include: ['**/*.jsx', '**/*.tsx'],
    usePolling: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
