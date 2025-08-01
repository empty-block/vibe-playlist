import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnoCSS({
      shortcuts: {
        'btn': 'px-4 py-2 rounded-lg font-semibold transition-all',
      },
      theme: {
        colors: {
          primary: '#667eea',
          secondary: '#764ba2'
        }
      }
    })
  ],
  server: {
    port: 4201
  }
})