import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(() => {
  console.log('Build-time environment check:');
  console.log('VITE_SPOTIFY_CLIENT_ID:', process.env.VITE_SPOTIFY_CLIENT_ID);
  console.log('VITE_SPOTIFY_REDIRECT_URI:', process.env.VITE_SPOTIFY_REDIRECT_URI);
  
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