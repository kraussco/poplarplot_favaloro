import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: [
      'poplarplot-favaloro.onrender.com',
      'localhost',
      '127.0.0.1'
    ]
  }
}) 