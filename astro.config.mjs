import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://illyrianbrains.org',
  output: 'static',
  vite: {
    // Serving Cytoscape directly avoids stale optimized-dependency URLs in dev,
    // which some browsers reject when Vite returns them without a JS MIME type.
    optimizeDeps: {
      exclude: ['cytoscape']
    }
  }
});
