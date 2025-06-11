import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: [
      'poplarplot-favaloro.onrender.com',
      'localhost',
      '127.0.0.1'
    ]
  },
  optimizeDeps: {
    include: ['react-katex', 'katex']
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
}) 