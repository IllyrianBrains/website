import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://illyrianbrains.org',
  output: 'static',
  redirects: {
    '/events': '/eventet/',
  },
  vite: {
    // Serving Cytoscape directly avoids stale optimized-dependency URLs in dev,
    // which some browsers reject when Vite returns them without a JS MIME type.
    // Leaflet has no ESM build to serve directly (only a UMD `main`), so instead
    // it's forced into Vite's initial dependency scan — it's otherwise only
    // discovered once a page using it loads, which triggers the same stale-URL
    // problem mid-session.
    optimizeDeps: {
      exclude: ['cytoscape'],
      include: ['leaflet']
    }
  }
});
