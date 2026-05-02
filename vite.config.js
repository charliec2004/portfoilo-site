import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Asset base must match where the site is actually served:
// - `charlieconner.com` is set in `public/CNAME`, so GitHub Pages serves this
//   project at the **domain root** (`/assets/...`), not `/portfolio-site/`.
// - A `base` of `/portfolio-site/` makes the HTML request
//   `/portfolio-site/assets/*.js`; that path does not exist on the custom
//   domain → GitHub returns an HTML error/404 page → the browser loads it
//   as JS and reports “disallowed MIME type (text/html)”.
//
// Visitors to `https://USER.github.io/REPO/` are redirected to the custom
// domain after it is configured, so root `base` is correct for production.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
});
