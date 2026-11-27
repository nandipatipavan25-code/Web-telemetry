import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://gawebtelemetry.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://gawebtelemetry.com',
        changeOrigin: true,
        ws: true,
        secure: false,
      }
    }
  }
});
