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
      // Production: uses Cloudflare Worker
      // Local dev: uses localhost
      'import.meta.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://jamzy-backend.ncmaddrey.workers.dev'
          : 'http://localhost:4201')
      ),
      // Spotify configuration
      'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_ID || ''),
      'import.meta.env.VITE_SPOTIFY_REDIRECT_URI': JSON.stringify(process.env.VITE_SPOTIFY_REDIRECT_URI || 'https://dev.jamzy-miniapp.pages.dev')
    }
  };
});
