import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(() => {
  return {
    plugins: [solidPlugin()],
    define: {
      // Force Vite to use process.env variables (what Cloudflare provides during build)
      'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_ID || 'your-spotify-client-id'),
      'import.meta.env.VITE_SPOTIFY_REDIRECT_URI': JSON.stringify(process.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development'),
      'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
    },
  server: {
    host: 'localhost',
    hmr: false, // Disable HMR to avoid WebSocket issues with Bun
  },
    build: {
      target: 'esnext'
    }
  };
});