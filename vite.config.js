import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/ask': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
});
