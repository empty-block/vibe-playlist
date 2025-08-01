import { createServer } from 'http'
import { Server } from 'socket.io'
import { readFileSync } from 'fs'

const httpServer = createServer((req, res) => {
  if (req.url === '/debug.html') {
    const html = readFileSync('./debug.html', 'utf8')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
    return
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`
    <h1>Vibes Test Server</h1>
    <p>Server is running!</p>
    <a href="/debug.html">Debug page</a>
  `)
})

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  socket.emit('test', 'Hello from server!')
})

httpServer.listen(4201, () => {
  console.log('🎵 Simple test server running on http://localhost:4201')
  console.log('Visit http://localhost:4201/debug.html to test')
})