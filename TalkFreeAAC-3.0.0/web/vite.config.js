import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative output works at a custom domain root and at a GitHub Pages
  // project path without hard-coding the repository name.
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  }
});
