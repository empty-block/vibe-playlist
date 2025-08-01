import { serve } from 'bun'
import { Server } from 'socket.io'
import { Database } from 'bun:sqlite'
import { v4 as uuidv4 } from 'uuid'
import { readFileSync } from 'fs'
import { join } from 'path'

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
  
  // Add default songs
  const defaultSongs = [
    {
      id: uuidv4(),
      playlist_id: 'default',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      duration: '5:55',
      video_id: 'fJ9rUzIMcZQ',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
      added_by: 'System',
      position: 0
    },
    {
      id: uuidv4(),
      playlist_id: 'default',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      duration: '8:02',
      video_id: 'QkF3oxziUI4',
      thumbnail: 'https://img.youtube.com/vi/QkF3oxziUI4/mqdefault.jpg',
      added_by: 'System',
      position: 1
    }
  ]
  
  const insertSong = db.prepare(
    "INSERT INTO songs (id, playlist_id, title, artist, duration, video_id, thumbnail, added_by, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
  
  defaultSongs.forEach(song => {
    insertSong.run(song.id, song.playlist_id, song.title, song.artist, song.duration, song.video_id, song.thumbnail, song.added_by, song.position)
  })
}

// In-memory state for real-time data
const users = new Map()
const playbackState = new Map()

// Create Bun server
const server = serve({
  port: 4201,
  async fetch(request) {
    const url = new URL(request.url)
    
    // API routes
    if (url.pathname.startsWith('/api/playlist/')) {
      const playlistId = url.pathname.split('/').pop()
      const playlist = db.query("SELECT * FROM playlists WHERE id = ?").get(playlistId)
      const songs = db.query("SELECT * FROM songs WHERE playlist_id = ? ORDER BY position").all(playlistId)
      
      return new Response(JSON.stringify({
        ...playlist,
        songs,
        currentSong: playbackState.get(playlistId)?.currentSong || null,
        isPlaying: playbackState.get(playlistId)?.isPlaying || false
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Serve static files from public directory
    if (url.pathname.startsWith('/assets/')) {
      try {
        const filePath = join('./public', url.pathname.replace('/assets/', ''))
        const file = readFileSync(filePath)
        return new Response(file)
      } catch {
        return new Response('Not found', { status: 404 })
      }
    }
    
    // Serve the main HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibes - Collaborative Playlist</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; }
      .btn { @apply px-4 py-2 rounded-lg font-semibold transition-all; }
    </style>
</head>
<body>
    <div id="root"></div>
    <div id="app-script">
      <h1 style="text-align: center; margin-top: 100px; font-family: system-ui;">
        Loading Vibes...
      </h1>
      <p style="text-align: center; color: #666;">
        This app requires JavaScript to be enabled.
      </p>
    </div>
    <script src="/socket.io/socket.io.js"></script>
    <script type="module">
      // For now, we'll inline the app code here
      // In production, this would be built and served separately
      document.getElementById('app-script').innerHTML = '<h1>Vibes is loading...</h1>';
    </script>
</body>
</html>`
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
})

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

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
    const connectedUsers = Array.from(users.values()).filter(u => 
      io.sockets.adapter.rooms.get(playlistId)?.has(u.id)
    )
    
    socket.emit('playlist-state', {
      ...playlist,
      songs,
      users: connectedUsers,
      currentSong: playbackState.get(playlistId)?.currentSong || null,
      isPlaying: playbackState.get(playlistId)?.isPlaying || false
    })
    
    socket.to(playlistId).emit('user-joined', user)
    socket.to(playlistId).emit('users-update', connectedUsers)
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
    
    // Reorder remaining songs
    const songs = db.query("SELECT * FROM songs WHERE playlist_id = ? ORDER BY position").all(playlistId)
    songs.forEach((song, index) => {
      db.run("UPDATE songs SET position = ? WHERE id = ?", [index, song.id])
    })
    
    io.to(playlistId).emit('song-removed', songId)
  })

  socket.on('play-pause', (data) => {
    const { playlistId, isPlaying, currentSong, currentTime } = data
    
    playbackState.set(playlistId, {
      isPlaying,
      currentSong,
      currentTime
    })
    
    io.to(playlistId).emit('playback-state', {
      isPlaying,
      currentSong,
      currentTime
    })
  })

  socket.on('change-song', (data) => {
    const { playlistId, songId } = data
    
    playbackState.set(playlistId, {
      isPlaying: true,
      currentSong: songId,
      currentTime: 0
    })
    
    io.to(playlistId).emit('song-changed', {
      currentSong: songId,
      isPlaying: true
    })
  })

  socket.on('youtube-search', async (data) => {
    const { query } = data
    
    // Mock results for now
    const mockResults = [
      {
        videoId: 'dQw4w9WgXcQ',
        title: query + ' - Official Video',
        artist: 'Artist Name',
        duration: '3:32',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      },
      {
        videoId: 'kJQP7kiw5Fk',
        title: query + ' - Live Performance',
        artist: 'Artist Name',
        duration: '4:20',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg'
      }
    ]
    
    socket.emit('youtube-results', mockResults)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    const user = users.get(socket.id)
    if (user) {
      users.delete(socket.id)
      
      // Notify all rooms the user was in
      const rooms = io.sockets.adapter.rooms
      rooms.forEach((sockets, roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('user-left', user)
          
          const connectedUsers = Array.from(users.values()).filter(u => 
            sockets.has(u.id)
          )
          socket.to(roomId).emit('users-update', connectedUsers)
        }
      })
    }
  })
})

console.log(`🎵 Vibes Playlist app (Bun + Solid.js) running on http://localhost:4201`)