import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    hmr: {
      clientPort: 3000, // Force client port
      protocol: 'ws',
      host: 'localhost'
    },
    watch: {
      usePolling: true // For some network environments
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
})