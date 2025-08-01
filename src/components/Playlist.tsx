import { Component, For, Show } from 'solid-js'
import { Song } from '../types'

interface PlaylistProps {
  songs: Song[]
  currentSongId: string | null
  isPlaying: boolean
  onPlaySong: (songId: string) => void
  onRemoveSong: (songId: string) => void
  onTogglePlayback: () => void
  onSkip: () => void
}

const Playlist: Component<PlaylistProps> = (props) => {
  return (
    <div class="w-[400px] bg-white/10 backdrop-blur-md p-6 overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-white text-xl font-bold">Vibes Playlist</h2>
        <span class="text-white/60 text-sm">
          {props.songs.length} song{props.songs.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div class="flex items-center gap-2 mb-6 pb-4 border-b border-white/20">
        <button 
          onClick={props.onTogglePlayback}
          class="bg-red-500 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <i class={`fas fa-${props.isPlaying ? 'pause' : 'play'}`}></i>
        </button>
        <button 
          onClick={props.onSkip}
          class="bg-blue-500 hover:bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
        >
          <i class="fas fa-forward"></i>
        </button>
      </div>
      
      <div class="space-y-2">
        <Show 
          when={props.songs.length > 0}
          fallback={
            <div class="text-white/50 text-center py-8">
              No songs in playlist yet. Add some!
            </div>
          }
        >
          <For each={props.songs}>
            {(song, index) => (
              <div 
                class={`
                  bg-white/10 rounded-lg p-3 flex items-center gap-3 cursor-pointer 
                  transition-all hover:bg-white/20 hover:-translate-y-1
                  ${song.id === props.currentSongId ? 'bg-red-500/20 border border-red-500/50' : ''}
                `}
                onClick={() => props.onPlaySong(song.id)}
              >
                <Show 
                  when={song.thumbnail}
                  fallback={
                    <div class="w-12 h-9 bg-white/20 rounded flex items-center justify-center text-white font-bold">
                      {index() + 1}
                    </div>
                  }
                >
                  <img 
                    src={song.thumbnail} 
                    alt={song.title}
                    class="w-12 h-9 rounded object-cover"
                  />
                </Show>
                
                <div class="flex-1">
                  <div class="text-white font-medium">{song.title}</div>
                  <div class="text-white/70 text-sm">{song.artist}</div>
                </div>
                
                <div class="text-white/50 text-xs">{song.duration}</div>
                <div class="text-white/40 text-xs">by {song.added_by}</div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    props.onRemoveSong(song.id)
                  }}
                  class="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-white/60 hover:text-white flex items-center justify-center transition-all opacity-0 hover:opacity-100"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}

export default Playlist