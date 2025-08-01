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

console.log('🎵 VIBES TIME MACHINE - Multi-Era Playlist running on http://localhost:4201')
console.log('🎨 Available themes:')
console.log('   • VIBES \'85 - Neon Synthwave')
console.log('   • VIBES \'92 - Grunge Alternative') 
console.log('   • VIBES \'95 - Windows 95 Digital')
console.log('   • VIBES 2000 - Y2K Matrix')
console.log('   • VIBES 2005 - iPod Era')
console.log('   • VIBES 2007 - MySpace Bling')
console.log('   • VIBES 2012 - Skeuomorphic')
console.log('🎭 Click the palette icon to switch themes!')
console.log('💾 Your theme preference is saved automatically')