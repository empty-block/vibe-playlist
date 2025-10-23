import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(() => {
  return {
    plugins: [solidPlugin()],
    server: {
      host: 'localhost',
      port: 3002,
      hmr: true,
    },
    build: {
      target: 'esnext'
    },
    define: {
      // Default to local backend, can override with VITE_API_URL env var
      'import.meta.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL || 'http://localhost:4201'
      )
    }
  };
});
