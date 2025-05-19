import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    port: 4173,
    host: true
  },
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './apps/web/src/main.tsx'
      }
    }
  }
});