import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves project sites from /<repo>/ — repo was renamed to
// `portfolio-site`, so production assets need that base path.
export default defineConfig({
  base: '/portfolio-site/',
  plugins: [react(), tailwindcss()],
});
