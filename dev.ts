import { build } from 'bun'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { Database } from 'bun:sqlite'
import { v4 as uuidv4 } from 'uuid'
import { watch } from 'fs'
import { join } from 'path'

// Build Solid.js app
async function buildApp() {
  console.log('Building Solid.js app...')
  
  try {
    await build({
      entrypoints: ['./src/index.tsx'],
      outdir: './dist',
      target: 'browser',
      format: 'esm',
      splitting: false,
      sourcemap: 'external',
      external: ['socket.io-client'],
      // Configure JSX for Solid.js
      define: {
        'process.env.NODE_ENV': '"development"'
      }
    })
    console.log('✅ Build complete!')
  } catch (error) {
    console.error('❌ Build failed:', error)
  }
}

// Initial build
await buildApp()

// Watch for changes
watch('./src', { recursive: true }, async (eventType, filename) => {
  if (filename?.endsWith('.tsx') || filename?.endsWith('.ts')) {
    console.log(`File changed: ${filename}`)
    await buildApp()
  }
})

// Set up database
const db = new Database('vibes.db')
db.run(`CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration TEXT,
  video_id TEXT,
  thumbnail TEXT,
  added_by TEXT,
  position INTEGER
)`)

const users = new Map()
const playbackState = { currentSong: null, isPlaying: false }

// HTTP Server
const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url!, 'http://localhost:4201')
  
  // Serve built JS
  if (url.pathname === '/dist/index.js') {
    try {
      const file = Bun.file('./dist/index.js')
      const content = await file.text()
      res.writeHead(200, { 'Content-Type': 'application/javascript' })
      res.end(content)
      return
    } catch (e) {
      res.writeHead(404)
      res.end('Build file not found')
      return
    }
  }
  
  // Serve Socket.io client from CDN in HTML
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`<!DOCTYPE html>
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
    <div id="root"></div>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
      // Make socket.io available globally for Solid.js
      window.io = io
    </script>
    <script type="module" src="/dist/index.js"></script>
</body>
</html>`)
})

// Socket.io setup
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
      const songCount = db.query("SELECT COUNT(*) as count FROM songs").get()?.count || 0
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

  socket.on('play-pause', (data) => {
    playbackState.isPlaying = data.isPlaying
    io.emit('playback-state', { isPlaying: data.isPlaying })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    users.delete(socket.id)
  })
})

httpServer.listen(4201, () => {
  console.log('🎵 Vibes dev server (Bun + Solid.js) running on http://localhost:4201')
  console.log('📁 Watching ./src for changes...')
})