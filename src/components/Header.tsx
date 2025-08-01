import { Component, For } from 'solid-js'
import { User } from '../types'

interface HeaderProps {
  users: User[]
  playlistName: string
  onAddSong: () => void
}

const Header: Component<HeaderProps> = (props) => {
  return (
    <header class="bg-black/20 backdrop-blur-md border-b border-white/20">
      <div class="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-white text-2xl font-bold flex items-center gap-2">
          <i class="fas fa-music text-yellow-400"></i>
          Vibes
        </h1>
        
        <div class="flex items-center gap-4">
          <span class="text-white/80 text-sm">{props.users.length} online</span>
          <div class="flex gap-2">
            <For each={props.users}>
              {(user) => (
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/30"
                  style={{ "background-color": user.color }}
                  title={user.username}
                >
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </For>
          </div>
          <button 
            onClick={props.onAddSong}
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:scale-105"
          >
            <i class="fas fa-plus"></i>
            Add Song
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header