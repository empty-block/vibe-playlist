import { createServer } from 'http'
import { Server } from 'socket.io'
import { Database } from 'bun:sqlite'
import { v4 as uuidv4 } from 'uuid'
import { spawn } from 'child_process'

// Start Vite dev server for frontend
const viteProcess = spawn('bunx', ['vite', '--port', '3000'], {
  stdio: 'inherit',
  cwd: process.cwd()
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

// Backend HTTP Server (just for Socket.io)
const httpServer = createServer((req, res) => {
  // Redirect to Vite dev server
  res.writeHead(302, { Location: 'http://localhost:3000' })
  res.end()
})

// Socket.io setup
const io = new Server(httpServer, {
  cors: { 
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  }
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
  console.log('🎵 Backend server running on http://localhost:4201')
  console.log('🚀 Frontend (Vite + Solid.js) running on http://localhost:3000')
  console.log('Open http://localhost:3000 in your browser!')
})

// Cleanup on exit
process.on('SIGINT', () => {
  viteProcess.kill()
  process.exit()
})