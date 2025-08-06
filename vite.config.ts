import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [solidPlugin()],
    define: {
      // Explicitly define env vars if they exist in process.env (for Cloudflare)
      ...(process.env.VITE_SPOTIFY_CLIENT_ID && {
        'import.meta.env.VITE_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.VITE_SPOTIFY_CLIENT_ID)
      }),
      ...(process.env.VITE_SPOTIFY_REDIRECT_URI && {
        'import.meta.env.VITE_SPOTIFY_REDIRECT_URI': JSON.stringify(process.env.VITE_SPOTIFY_REDIRECT_URI)
      }),
    },
  server: {
    host: 'localhost', // For local development
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  },
    build: {
      target: 'esnext'
    }
  };
});