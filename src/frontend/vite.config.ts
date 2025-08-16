import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["socket.io-client"],
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://backend:3000",
        ws: true, // Enable WebSocket proxying
      },
      "/api": {
        target: "http://backend:3000",
      },
    },
  },
})
