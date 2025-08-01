import { serve } from 'bun'
import { readFileSync } from 'fs'

serve({
  port: 4201,
  async fetch(request) {
    const url = new URL(request.url)
    
    // Serve built JS
    if (url.pathname === '/src/index.tsx') {
      // For now, let's just serve a plain JS version
      const jsCode = `
import { render } from 'https://esm.sh/solid-js@1.8.7/web'
import { createSignal, Show, For } from 'https://esm.sh/solid-js@1.8.7'

const App = () => {
  const [songs, setSongs] = createSignal([
    {
      id: '1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      duration: '5:55',
      videoId: 'fJ9rUzIMcZQ',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
      addedBy: 'System'
    },
    {
      id: '2',
      title: 'Stairway to Heaven', 
      artist: 'Led Zeppelin',
      duration: '8:02',
      videoId: 'QkF3oxziUI4',
      thumbnail: 'https://img.youtube.com/vi/QkF3oxziUI4/mqdefault.jpg',
      addedBy: 'System'
    }
  ])
  
  const [currentSongId, setCurrentSongId] = createSignal('1')
  const [isPlaying, setIsPlaying] = createSignal(false)
  const [showAddModal, setShowAddModal] = createSignal(false)

  const currentSong = () => songs().find(s => s.id === currentSongId())

  const addSong = (title, artist) => {
    const newSong = {
      id: Date.now().toString(),
      title,
      artist,
      duration: '3:00',
      videoId: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      addedBy: 'You'
    }
    setSongs(prev => [...prev, newSong])
    setShowAddModal(false)
  }

  const removeSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id))
    if (currentSongId() === id) {
      const remaining = songs().filter(s => s.id !== id)
      setCurrentSongId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  return () => (
    \`<div class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      <header class="bg-black/20 backdrop-blur-md border-b border-white/20">
        <div class="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 class="text-white text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-music text-yellow-400"></i>
            Vibes
          </h1>
          <button 
            onclick="showAddModal(true)"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
          >
            <i class="fas fa-plus"></i>
            Add Song
          </button>
        </div>
      </header>

      <main class="flex h-[calc(100vh-70px)]">
        <div class="flex-1 bg-black flex flex-col">
          <div class="flex-1 relative">
            \${currentSong() ?
              \`<iframe 
                src="https://www.youtube.com/embed/\${currentSong().videoId}?autoplay=\${isPlaying() ? 1 : 0}"
                class="w-full h-full"
                allow="autoplay; encrypted-media"
                allowfullscreen
              />\` :
              \`<div class="absolute inset-0 flex items-center justify-center text-white/50">
                <div class="text-center">
                  <i class="fas fa-play-circle text-6xl mb-4"></i>
                  <p class="text-lg">Select a song to start playing</p>
                </div>
              </div>\`
            }
          </div>
          
          \${currentSong() ? 
            \`<div class="bg-black/50 p-4 border-t border-white/10">
              <h3 class="text-white font-bold mb-2">Now Playing</h3>
              <div class="flex items-center gap-4">
                <img 
                  src="\${currentSong().thumbnail}" 
                  alt="\${currentSong().title}"
                  class="w-16 h-12 rounded object-cover"
                />
                <div>
                  <div class="text-white font-semibold">\${currentSong().title}</div>
                  <div class="text-white/70 text-sm">\${currentSong().artist}</div>
                </div>
              </div>
            </div>\` : ''
          }
        </div>

        <div class="w-[400px] bg-white/10 backdrop-blur-md p-6 overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-white text-xl font-bold">Vibes Playlist</h2>
            <span class="text-white/60 text-sm">
              \${songs().length} song\${songs().length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-white/20">
            <button 
              onclick="setIsPlaying(!isPlaying())"
              class="bg-red-500 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <i class="fas fa-\${isPlaying() ? 'pause' : 'play'}"></i>
            </button>
          </div>
          
          <div class="space-y-2">
            \${songs().map(song => 
              \`<div 
                class="bg-white/10 rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-white/20 hover:-translate-y-1 \${song.id === currentSongId() ? 'bg-red-500/20 border border-red-500/50' : ''}"
                onclick="setCurrentSongId('\${song.id}')"
              >
                <img 
                  src="\${song.thumbnail}" 
                  alt="\${song.title}"
                  class="w-12 h-9 rounded object-cover"
                />
                
                <div class="flex-1">
                  <div class="text-white font-medium">\${song.title}</div>
                  <div class="text-white/70 text-sm">\${song.artist}</div>
                </div>
                
                <div class="text-white/50 text-xs">\${song.duration}</div>
                <div class="text-white/40 text-xs">by \${song.addedBy}</div>
                
                <button 
                  onclick="removeSong('\${song.id}'); event.stopPropagation()"
                  class="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-white/60 hover:text-white flex items-center justify-center transition-all"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>\`
            ).join('')}
          </div>
        </div>
      </main>
    </div>\`
  )
}

render(() => App(), document.getElementById('root'))
      `
      return new Response(jsCode, {
        headers: { 'Content-Type': 'application/javascript' }
      })
    }
    
    // Serve main HTML
    const html = \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibes - Collaborative Playlist</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#667eea',
              secondary: '#764ba2'
            }
          }
        }
      }
    </script>
</head>
<body>
    <div id="root">
      <div class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div class="text-white text-center">
          <i class="fas fa-music text-6xl mb-4"></i>
          <h1 class="text-3xl font-bold mb-2">Vibes Playlist</h1>
          <p class="text-white/70">Loading...</p>
        </div>
      </div>
    </div>
    <script type="module" src="/src/index.tsx"></script>
</body>
</html>\`
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
})

console.log('🎵 Vibes app running on http://localhost:4201')