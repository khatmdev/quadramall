import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Giữ alias @ trỏ đến src/
    },
  },
  define: {
    global: 'window',  // Polyfill global -> window để fix lỗi sockjs-client (browser không có global như Node.js)
  },
  esbuild: {
    jsx: 'automatic', // Bật hỗ trợ JSX trong file .ts
  },
});