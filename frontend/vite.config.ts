import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/bookmarks': 'http://localhost:3000',
      '/categories': 'http://localhost:3000',
      '/import-export': 'http://localhost:3000',
    },
  },
});
