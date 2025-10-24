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
      // API URL configuration
      // Local dev: defaults to http://localhost:4201
      // Production: set VITE_API_URL to your Cloudflare Workers URL
      // Example: VITE_API_URL=https://jamzy-backend.workers.dev bun run build
      'import.meta.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL || 'http://localhost:4201'
      )
    }
  };
});
