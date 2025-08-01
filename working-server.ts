import { createServer } from 'http'
import { Server } from 'socket.io'
import { Database } from 'bun:sqlite'
import { v4 as uuidv4 } from 'uuid'

// Initialize SQLite database
const db = new Database('vibes.db')
db.run(`
  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration TEXT,
    video_id TEXT,
    thumbnail TEXT,
    added_by TEXT,
    position INTEGER
  )
`)

// In-memory state
const users = new Map()
const playbackState = { currentSong: null, isPlaying: false }

const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibes - Collaborative Playlist</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div id="app" class="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div class="flex items-center justify-center h-screen">
            <div class="text-center">
                <i class="fas fa-music text-6xl mb-4"></i>
                <h1 class="text-3xl font-bold mb-4">Vibes Playlist</h1>
                <p id="status">Connecting...</p>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
        console.log('Starting app...')
        
        const socket = io()
        let username = ''
        let songs = []
        let currentSongId = null
        let isPlaying = false
        
        socket.on('connect', () => {
            console.log('Connected!')
            document.getElementById('status').innerHTML = 'Connected! Initializing...'
            showUsernameModal()
        })
        
        socket.on('playlist-state', (state) => {
            console.log('Got playlist state:', state)
            songs = state.songs || []
            currentSongId = state.currentSong
            isPlaying = state.isPlaying
            renderApp()
        })
        
        socket.on('song-added', (song) => {
            console.log('Song added:', song)
            songs.push(song)
            renderApp()
        })
        
        function showUsernameModal() {
            document.getElementById('app').innerHTML = \`
                <div class="fixed inset-0 flex items-center justify-center p-4">
                    <div class="bg-white text-black rounded-lg p-6 max-w-md w-full">
                        <h2 class="text-2xl font-bold mb-4">Join the Vibes</h2>
                        <input 
                            type="text" 
                            id="username-input"
                            placeholder="Enter your name"
                            class="w-full px-4 py-2 border rounded-lg mb-4"
                        />
                        <button 
                            onclick="joinPlaylist()"
                            class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                        >
                            Join Playlist
                        </button>
                    </div>
                </div>
            \`
        }
        
        function joinPlaylist() {
            const input = document.getElementById('username-input')
            username = input.value.trim()
            if (username) {
                socket.emit('join-playlist', { username })
            }
        }
        
        function renderApp() {
            document.getElementById('app').innerHTML = \`
                <div class="container mx-auto p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h1 class="text-3xl font-bold">
                            <i class="fas fa-music text-yellow-400 mr-2"></i>
                            Vibes Playlist
                        </h1>
                        <button 
                            onclick="addSong()"
                            class="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                        >
                            <i class="fas fa-plus mr-2"></i>Add Song
                        </button>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Player -->
                        <div class="bg-black/20 rounded-lg p-6">
                            <h3 class="text-xl font-bold mb-4">Now Playing</h3>
                            \${currentSongId ? 
                                \`<div class="flex items-center gap-4">
                                    <img src="\${songs.find(s => s.id === currentSongId)?.thumbnail}" class="w-20 h-15 rounded">
                                    <div>
                                        <div class="font-bold">\${songs.find(s => s.id === currentSongId)?.title}</div>
                                        <div class="text-gray-300">\${songs.find(s => s.id === currentSongId)?.artist}</div>
                                    </div>
                                </div>\` :
                                '<p class="text-gray-400">No song playing</p>'
                            }
                            <div class="mt-4">
                                <button onclick="togglePlay()" class="bg-red-500 w-12 h-12 rounded-full hover:bg-red-600 mr-2">
                                    <i class="fas fa-\${isPlaying ? 'pause' : 'play'}"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Playlist -->
                        <div class="bg-black/20 rounded-lg p-6">
                            <h3 class="text-xl font-bold mb-4">Playlist (\${songs.length} songs)</h3>
                            <div class="space-y-2 max-h-96 overflow-y-auto">
                                \${songs.length === 0 ? 
                                    '<p class="text-gray-400">No songs yet. Add some!</p>' :
                                    songs.map((song, i) => \`
                                        <div 
                                            onclick="playSong('\${song.id}')"
                                            class="flex items-center gap-3 p-2 rounded hover:bg-white/10 cursor-pointer \${song.id === currentSongId ? 'bg-red-500/20' : ''}"
                                        >
                                            <img src="\${song.thumbnail}" class="w-12 h-9 rounded object-cover">
                                            <div class="flex-1">
                                                <div class="font-medium">\${song.title}</div>
                                                <div class="text-sm text-gray-300">\${song.artist}</div>
                                            </div>
                                            <button 
                                                onclick="removeSong('\${song.id}'); event.stopPropagation()"
                                                class="text-gray-400 hover:text-white p-1"
                                            >
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    \`).join('')
                                }
                            </div>
                        </div>
                    </div>
                </div>
            \`
        }
        
        function addSong() {
            const title = prompt('Song title:')
            const artist = prompt('Artist:')
            if (title && artist) {
                socket.emit('add-song', {
                    song: {
                        title,
                        artist,
                        duration: '3:00',
                        videoId: 'dQw4w9WgXcQ',
                        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
                    }
                })
            }
        }
        
        function playSong(songId) {
            socket.emit('change-song', { songId })
        }
        
        function removeSong(songId) {
            socket.emit('remove-song', { songId })
        }
        
        function togglePlay() {
            socket.emit('toggle-play')
        }
        
        // Make functions global
        window.joinPlaylist = joinPlaylist
        window.addSong = addSong
        window.playSong = playSong
        window.removeSong = removeSong
        window.togglePlay = togglePlay
    </script>
</body>
</html>`)
})

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-playlist', (data) => {
    const { username } = data
    users.set(socket.id, { username, id: socket.id })
    
    const songs = db.query("SELECT * FROM songs ORDER BY position").all()
    
    socket.emit('playlist-state', {
      songs,
      currentSong: playbackState.currentSong,
      isPlaying: playbackState.isPlaying
    })
  })

  socket.on('add-song', (data) => {
    const { song } = data
    const user = users.get(socket.id)
    
    if (user) {
      const songCount = db.query("SELECT COUNT(*) as count FROM songs").get().count || 0
      const newSong = {
        id: uuidv4(),
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        video_id: song.videoId,
        thumbnail: song.thumbnail,
        added_by: user.username,
        position: songCount
      }
      
      db.run(
        "INSERT INTO songs (id, title, artist, duration, video_id, thumbnail, added_by, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [newSong.id, newSong.title, newSong.artist, newSong.duration, newSong.video_id, newSong.thumbnail, newSong.added_by, newSong.position]
      )
      
      io.emit('song-added', newSong)
    }
  })

  socket.on('remove-song', (data) => {
    const { songId } = data
    db.run("DELETE FROM songs WHERE id = ?", [songId])
    io.emit('song-removed', songId)
  })

  socket.on('change-song', (data) => {
    const { songId } = data
    playbackState.currentSong = songId
    playbackState.isPlaying = true
    io.emit('song-changed', { currentSong: songId, isPlaying: true })
  })

  socket.on('toggle-play', () => {
    playbackState.isPlaying = !playbackState.isPlaying
    io.emit('playback-toggled', { isPlaying: playbackState.isPlaying })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    users.delete(socket.id)
  })
})

httpServer.listen(4201, () => {
  console.log('🎵 Vibes working server running on http://localhost:4201')
})