import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Required for Docker/Cloud Run
    port: 3000,
    open: true,
    strictPort: true, // Fail if port is in use
    proxy: {
    },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3001'),
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
});