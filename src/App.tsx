import { Component, createSignal, Show, For } from 'solid-js'

interface Song {
  id: string
  title: string
  artist: string
  duration: string
  videoId: string
  thumbnail: string
  addedBy: string
}

const App: Component = () => {
  const [songs, setSongs] = createSignal<Song[]>([
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
  
  const [currentSongId, setCurrentSongId] = createSignal<string | null>('1')
  const [isPlaying, setIsPlaying] = createSignal(false)
  const [showAddModal, setShowAddModal] = createSignal(false)

  const currentSong = () => songs().find(s => s.id === currentSongId())

  const addSong = (title: string, artist: string) => {
    const newSong: Song = {
      id: Date.now().toString(),
      title,
      artist,
      duration: '3:00',
      videoId: 'dQw4w9WgXcQ', // Rick Roll for now 😄
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      addedBy: 'You'
    }
    setSongs(prev => [...prev, newSong])
    setShowAddModal(false)
  }

  const removeSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id))
    if (currentSongId() === id) {
      const remaining = songs().filter(s => s.id !== id)
      setCurrentSongId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const playNext = () => {
    const currentIndex = songs().findIndex(s => s.id === currentSongId())
    const nextIndex = (currentIndex + 1) % songs().length
    setCurrentSongId(songs()[nextIndex]?.id || null)
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      {/* Header */}
      <header class="bg-black/20 backdrop-blur-md border-b border-white/20">
        <div class="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 class="text-white text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-music text-yellow-400"></i>
            Vibes
          </h1>
          <button 
            onClick={() => setShowAddModal(true)}
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
          >
            <i class="fas fa-plus"></i>
            Add Song
          </button>
        </div>
      </header>

      <main class="flex h-[calc(100vh-70px)]">
        {/* Video Player */}
        <div class="flex-1 bg-black flex flex-col">
          <div class="flex-1 relative">
            <Show 
              when={currentSong()}
              fallback={
                <div class="absolute inset-0 flex items-center justify-center text-white/50">
                  <div class="text-center">
                    <i class="fas fa-play-circle text-6xl mb-4"></i>
                    <p class="text-lg">Select a song to start playing</p>
                  </div>
                </div>
              }
            >
              <iframe 
                src={`https://www.youtube.com/embed/${currentSong()!.videoId}?autoplay=${isPlaying() ? 1 : 0}`}
                class="w-full h-full"
                allow="autoplay; encrypted-media"
                allowfullscreen
              />
            </Show>
          </div>
          
          <Show when={currentSong()}>
            <div class="bg-black/50 p-4 border-t border-white/10">
              <h3 class="text-white font-bold mb-2">Now Playing</h3>
              <div class="flex items-center gap-4">
                <img 
                  src={currentSong()!.thumbnail} 
                  alt={currentSong()!.title}
                  class="w-16 h-12 rounded object-cover"
                />
                <div>
                  <div class="text-white font-semibold">{currentSong()!.title}</div>
                  <div class="text-white/70 text-sm">{currentSong()!.artist}</div>
                </div>
              </div>
            </div>
          </Show>
        </div>

        {/* Playlist */}
        <div class="w-[400px] bg-white/10 backdrop-blur-md p-6 overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-white text-xl font-bold">Vibes Playlist</h2>
            <span class="text-white/60 text-sm">
              {songs().length} song{songs().length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-white/20">
            <button 
              onClick={() => setIsPlaying(!isPlaying())}
              class="bg-red-500 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <i class={`fas fa-${isPlaying() ? 'pause' : 'play'}`}></i>
            </button>
            <button 
              onClick={playNext}
              class="bg-blue-500 hover:bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <i class="fas fa-forward"></i>
            </button>
          </div>
          
          <div class="space-y-2">
            <For each={songs()}>
              {(song) => (
                <div 
                  class={`
                    bg-white/10 rounded-lg p-3 flex items-center gap-3 cursor-pointer 
                    transition-all hover:bg-white/20 hover:-translate-y-1
                    ${song.id === currentSongId() ? 'bg-red-500/20 border border-red-500/50' : ''}
                  `}
                  onClick={() => setCurrentSongId(song.id)}
                >
                  <img 
                    src={song.thumbnail} 
                    alt={song.title}
                    class="w-12 h-9 rounded object-cover"
                  />
                  
                  <div class="flex-1">
                    <div class="text-white font-medium">{song.title}</div>
                    <div class="text-white/70 text-sm">{song.artist}</div>
                  </div>
                  
                  <div class="text-white/50 text-xs">{song.duration}</div>
                  <div class="text-white/40 text-xs">by {song.addedBy}</div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSong(song.id)
                    }}
                    class="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-white/60 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <i class="fas fa-times text-sm"></i>
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      </main>

      {/* Add Song Modal */}
      <Show when={showAddModal()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-0 max-w-md w-[90%] overflow-hidden">
            <div class="p-6 border-b flex justify-between items-center">
              <h3 class="text-2xl font-bold text-gray-800">Add Song</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const title = formData.get('title') as string
                const artist = formData.get('artist') as string
                if (title && artist) {
                  addSong(title, artist)
                }
              }}
              class="p-6"
            >
              <input 
                name="title"
                type="text"
                placeholder="Song title"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                autofocus
              />
              <input 
                name="artist"
                type="text"
                placeholder="Artist"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              />
              <button 
                type="submit"
                class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Add Song
              </button>
            </form>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default App