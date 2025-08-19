import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  assetsInclude: ['**/*.geojson'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Đảm bảo alias @/ trỏ đến src/
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          helmet: ['react-helmet-async']
        }
      }
    }
  },
  server: {port: 3000},
  define: {
    global: 'window'
  }
});