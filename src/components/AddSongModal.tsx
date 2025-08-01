import { Component, createSignal, For, Show } from 'solid-js'
import { Socket } from 'socket.io-client'

interface AddSongModalProps {
  socket: Socket
  onClose: () => void
  onAddSong: (song: any) => void
}

interface SearchResult {
  videoId: string
  title: string
  artist: string
  duration: string
  thumbnail: string
}

const AddSongModal: Component<AddSongModalProps> = (props) => {
  const [query, setQuery] = createSignal('')
  const [results, setResults] = createSignal<SearchResult[]>([])
  const [loading, setLoading] = createSignal(false)
  
  const handleSearch = (e: Event) => {
    e.preventDefault()
    if (!query().trim()) return
    
    setLoading(true)
    props.socket.emit('youtube-search', { query: query() })
    
    props.socket.once('youtube-results', (searchResults: SearchResult[]) => {
      setResults(searchResults)
      setLoading(false)
    })
  }
  
  const handleAddSong = (result: SearchResult) => {
    props.onAddSong(result)
  }
  
  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-0 max-w-4xl w-[90%] max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-2xl font-bold text-gray-800">Search YouTube</h3>
          <button 
            onClick={props.onClose}
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6">
          <form onSubmit={handleSearch} class="flex gap-3 mb-6">
            <input 
              type="text"
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search for songs on YouTube..."
              class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autofocus
            />
            <button 
              type="submit"
              disabled={!query().trim() || loading()}
              class="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              <Show when={!loading()} fallback={<i class="fas fa-spinner fa-spin"></i>}>
                Search
              </Show>
            </button>
          </form>
          
          <div class="max-h-[400px] overflow-y-auto space-y-3">
            <Show 
              when={results().length > 0}
              fallback={
                <Show when={loading()}>
                  <div class="text-center text-gray-500 py-8">
                    Searching...
                  </div>
                </Show>
              }
            >
              <For each={results()}>
                {(result) => (
                  <div 
                    onClick={() => handleAddSong(result)}
                    class="flex gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <img 
                      src={result.thumbnail} 
                      alt={result.title}
                      class="w-32 h-24 rounded object-cover"
                    />
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800">{result.title}</div>
                      <div class="text-gray-600 text-sm mt-1">{result.artist}</div>
                      <div class="text-gray-500 text-xs mt-2">{result.duration}</div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSongModal