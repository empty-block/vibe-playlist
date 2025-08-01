import { createServer } from 'http'
import { Server } from 'socket.io'
import { Database } from 'bun:sqlite'
import { v4 as uuidv4 } from 'uuid'
import { file } from 'bun'

// Create HTTP server manually to work with Socket.io
const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:4201`)
  
  // Skip serving socket.io client - we'll use CDN
  
  // Serve the app
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibes - Collaborative Playlist</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    <div id="root">
      <div class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div class="text-white text-center">
          <i class="fas fa-music text-6xl mb-4"></i>
          <h1 class="text-3xl font-bold mb-2">Vibes Playlist</h1>
          <p class="text-white/70">Real-time collaborative playlist powered by Bun + Solid.js</p>
          <p class="text-white/50 text-sm mt-4">Loading application...</p>
        </div>
      </div>
    </div>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script type="module">
      // For now, let's create a simple vanilla JS version to test
      const socket = io()
      const root = document.getElementById('root')
      
      let username = ''
      let playlistId = 'default'
      let songs = []
      let currentSongId = null
      let isPlaying = false
      
      // Simple UI
      function render() {
        root.innerHTML = \`
          <div class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
            \${!username ? renderUsernameModal() : renderApp()}
          </div>
        \`
        
        // Add event listeners
        if (!username) {
          const form = document.getElementById('username-form')
          form?.addEventListener('submit', (e) => {
            e.preventDefault()
            const input = document.getElementById('username-input')
            if (input.value.trim()) {
              username = input.value.trim()
              socket.emit('join-playlist', { playlistId, username })
              render()
            }
          })
        } else {
          // Add song button
          document.getElementById('add-song-btn')?.addEventListener('click', () => {
            const title = prompt('Song title:')
            const artist = prompt('Artist:')
            if (title && artist) {
              socket.emit('add-song', {
                playlistId,
                song: {
                  title,
                  artist,
                  duration: '3:00',
                  videoId: 'dQw4w9WgXcQ',
                  thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
                }
              })
            }
          })
          
          // Play button
          document.getElementById('play-btn')?.addEventListener('click', () => {
            if (!currentSongId && songs.length > 0) {
              socket.emit('change-song', { playlistId, songId: songs[0].id })
            } else if (currentSongId) {
              isPlaying = !isPlaying
              socket.emit('play-pause', { playlistId, isPlaying, currentSong: currentSongId })
            }
          })
          
          // Song items
          document.querySelectorAll('.song-item').forEach(el => {
            el.addEventListener('click', () => {
              const songId = el.dataset.songId
              socket.emit('change-song', { playlistId, songId })
            })
          })
          
          // Remove buttons
          document.querySelectorAll('.remove-song').forEach(el => {
            el.addEventListener('click', (e) => {
              e.stopPropagation()
              const songId = el.dataset.songId
              socket.emit('remove-song', { playlistId, songId })
            })
          })
        }
      }
      
      function renderUsernameModal() {
        return \`
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 class="text-2xl font-bold mb-4">Join the Vibes</h2>
              <form id="username-form">
                <input 
                  type="text" 
                  id="username-input"
                  placeholder="Enter your name"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autofocus
                />
                <button type="submit" class="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                  Join Playlist
                </button>
              </form>
            </div>
          </div>
        \`
      }
      
      function renderApp() {
        return \`
          <div class="flex h-screen">
            <!-- Video Player -->
            <div class="flex-1 bg-black flex items-center justify-center">
              <div class="text-white text-center">
                <i class="fas fa-play-circle text-6xl mb-4"></i>
                <p>Video player will go here</p>
                \${currentSongId ? \`<p class="mt-4">Now playing: \${songs.find(s => s.id === currentSongId)?.title}</p>\` : ''}
              </div>
            </div>
            
            <!-- Playlist -->
            <div class="w-96 bg-white/10 backdrop-blur-md p-6 overflow-y-auto">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-white text-xl font-bold">Vibes Playlist</h2>
                <button id="add-song-btn" class="bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600">
                  <i class="fas fa-plus"></i> Add Song
                </button>
              </div>
              
              <div class="flex gap-2 mb-6">
                <button id="play-btn" class="bg-red-500 text-white w-12 h-12 rounded-full hover:bg-red-600">
                  <i class="fas fa-\${isPlaying ? 'pause' : 'play'}"></i>
                </button>
              </div>
              
              <div class="space-y-2">
                \${songs.length === 0 ? 
                  '<p class="text-white/50 text-center py-8">No songs yet. Add some!</p>' :
                  songs.map((song, index) => \`
                    <div 
                      class="song-item bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/20 \${song.id === currentSongId ? 'bg-red-500/20 border border-red-500' : ''}"
                      data-song-id="\${song.id}"
                    >
                      <div class="flex items-center gap-3">
                        <img src="\${song.thumbnail}" class="w-12 h-9 rounded object-cover" />
                        <div class="flex-1">
                          <div class="text-white font-medium">\${song.title}</div>
                          <div class="text-white/70 text-sm">\${song.artist}</div>
                        </div>
                        <button class="remove-song text-white/50 hover:text-white" data-song-id="\${song.id}">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  \`).join('')
                }
              </div>
            </div>
          </div>
        \`
      }
      
      // Socket handlers
      socket.on('playlist-state', (state) => {
        songs = state.songs
        currentSongId = state.currentSong
        isPlaying = state.isPlaying
        render()
      })
      
      socket.on('song-added', (song) => {
        songs.push(song)
        render()
      })
      
      socket.on('song-removed', (songId) => {
        songs = songs.filter(s => s.id !== songId)
        if (currentSongId === songId) currentSongId = null
        render()
      })
      
      socket.on('playback-state', (state) => {
        isPlaying = state.isPlaying
        currentSongId = state.currentSong
        render()
      })
      
      socket.on('song-changed', (state) => {
        currentSongId = state.currentSong
        isPlaying = state.isPlaying
        render()
      })
      
      // Initial render
      render()
    </script>
</body>
</html>`)
})

// Set up Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Initialize SQLite database
const db = new Database('vibes.db')
db.run(`
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)
db.run(`
  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration TEXT,
    video_id TEXT,
    thumbnail TEXT,
    added_by TEXT,
    position INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id)
  )
`)

// Create default playlist if it doesn't exist
const defaultPlaylist = db.query("SELECT * FROM playlists WHERE id = 'default'").get()
if (!defaultPlaylist) {
  db.run("INSERT INTO playlists (id, name) VALUES ('default', 'Vibes Playlist')")
}

// In-memory state for real-time data
const users = new Map()
const playbackState = new Map()

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-playlist', (data) => {
    const { playlistId, username } = data
    const user = {
      id: socket.id,
      username: username || `User${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    }
    
    users.set(socket.id, user)
    socket.join(playlistId)
    
    // Get playlist data
    const playlist = db.query("SELECT * FROM playlists WHERE id = ?").get(playlistId)
    const songs = db.query("SELECT * FROM songs WHERE playlist_id = ? ORDER BY position").all(playlistId)
    
    socket.emit('playlist-state', {
      ...playlist,
      songs,
      currentSong: playbackState.get(playlistId)?.currentSong || null,
      isPlaying: playbackState.get(playlistId)?.isPlaying || false
    })
    
    socket.to(playlistId).emit('user-joined', user)
  })

  socket.on('add-song', (data) => {
    const { playlistId, song } = data
    const user = users.get(socket.id)
    
    if (user) {
      const result = db.query("SELECT COUNT(*) as count FROM songs WHERE playlist_id = ?").get(playlistId)
      const songCount = result ? result.count : 0
      const newSong = {
        id: uuidv4(),
        playlist_id: playlistId,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        video_id: song.videoId,
        thumbnail: song.thumbnail,
        added_by: user.username,
        position: songCount
      }
      
      db.run(
        "INSERT INTO songs (id, playlist_id, title, artist, duration, video_id, thumbnail, added_by, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [newSong.id, newSong.playlist_id, newSong.title, newSong.artist, newSong.duration, newSong.video_id, newSong.thumbnail, newSong.added_by, newSong.position]
      )
      
      io.to(playlistId).emit('song-added', newSong)
    }
  })

  socket.on('remove-song', (data) => {
    const { playlistId, songId } = data
    
    db.run("DELETE FROM songs WHERE id = ? AND playlist_id = ?", [songId, playlistId])
    io.to(playlistId).emit('song-removed', songId)
  })

  socket.on('play-pause', (data) => {
    const { playlistId, isPlaying, currentSong } = data
    
    playbackState.set(playlistId, {
      isPlaying,
      currentSong
    })
    
    io.to(playlistId).emit('playback-state', {
      isPlaying,
      currentSong
    })
  })

  socket.on('change-song', (data) => {
    const { playlistId, songId } = data
    
    playbackState.set(playlistId, {
      isPlaying: true,
      currentSong: songId
    })
    
    io.to(playlistId).emit('song-changed', {
      currentSong: songId,
      isPlaying: true
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    users.delete(socket.id)
  })
})

// Start server
httpServer.listen(4201, () => {
  console.log('🎵 Vibes Playlist (Bun edition) running on http://localhost:4201')
})