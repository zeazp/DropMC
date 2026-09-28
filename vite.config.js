import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets load correctly on GitHub Pages, Vercel, Netlify, subdirectories, or custom domains
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-3d': ['three', 'skinview3d']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
