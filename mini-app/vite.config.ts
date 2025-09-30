import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(() => {
  return {
    plugins: [solidPlugin()],
    server: {
      host: 'localhost',
      port: 3002,
      hmr: false,
    },
    build: {
      target: 'esnext'
    }
  };
});
