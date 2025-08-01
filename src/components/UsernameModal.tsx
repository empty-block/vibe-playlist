import { Component, createSignal } from 'solid-js'

interface UsernameModalProps {
  onJoin: (username: string) => void
}

const UsernameModal: Component<UsernameModalProps> = (props) => {
  const [username, setUsername] = createSignal('')
  
  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (username().trim()) {
      props.onJoin(username().trim())
    }
  }
  
  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-0 max-w-md w-[90%] overflow-hidden">
        <div class="p-6 border-b">
          <h3 class="text-2xl font-bold text-gray-800">Join the Vibes</h3>
        </div>
        
        <form onSubmit={handleSubmit} class="p-6">
          <input 
            type="text"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            placeholder="Enter your name"
            maxLength={20}
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            autofocus
          />
          
          <button 
            type="submit"
            disabled={!username().trim()}
            class="w-full mt-4 bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
          >
            Join Playlist
          </button>
        </form>
      </div>
    </div>
  )
}

export default UsernameModal