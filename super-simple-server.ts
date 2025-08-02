import { serve } from 'bun'
import { readFileSync } from 'fs'

serve({
  port: 4201,
  fetch(request) {
    const html = readFileSync('./vibes-themes.html', 'utf8')
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
})

console.log('🎵 VIBES - Retro Music Playlist App')
console.log('🚀 Running on http://localhost:4201')
console.log('✨ Pure vanilla JS + HTML - no build step needed!')
console.log('🎨 Features: Themes, DJ Bot, Social Feed, Drag-to-resize')
console.log('📝 Edit vibes-themes.html and refresh to see changes')