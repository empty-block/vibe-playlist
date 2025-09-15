import { serve } from 'bun'
import { readFileSync } from 'fs'
import { LibraryAPI } from './api/library'

const libraryAPI = new LibraryAPI()

serve({
  port: 4201,
  fetch(request) {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    try {
      // API routes
      if (pathname === '/api/library') {
        return libraryAPI.handleRequest(request)
      }
      
      // Serve different file types
      if (pathname === '/' || pathname === '/index.html') {
        const html = readFileSync('./vibes-themes.html', 'utf8')
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        })
      } else if (pathname === '/app.js') {
        const js = readFileSync('./app.js', 'utf8')
        return new Response(js, {
          headers: { 'Content-Type': 'application/javascript' }
        })
      } else if (pathname === '/tailwind-config.js') {
        const js = readFileSync('./tailwind-config.js', 'utf8')
        return new Response(js, {
          headers: { 'Content-Type': 'application/javascript' }
        })
      } else {
        return new Response('Not Found', { status: 404 })
      }
    } catch (error) {
      return new Response('Server Error', { status: 500 })
    }
  }
})

console.log('🎵 VIBES - Retro Music Playlist App')
console.log('🚀 Running on http://localhost:4201')
console.log('✨ Pure vanilla JS + HTML - no build step needed!')