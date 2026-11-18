import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development, /api calls go to the Express server, so cookies stay same-origin
    proxy: { '/api': 'http://localhost:5000' },
  },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
});
