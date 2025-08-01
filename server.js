const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static('public'));

// In-memory storage for playlists and users
const playlists = new Map();
const users = new Map();

// Create a default playlist
const defaultPlaylist = {
  id: 'default',
  name: 'Vibes Playlist',
  songs: [
    { 
      id: '1', 
      title: 'Bohemian Rhapsody', 
      artist: 'Queen', 
      duration: '5:55', 
      addedBy: 'System',
      videoId: 'fJ9rUzIMcZQ',
      thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg'
    },
    { 
      id: '2', 
      title: 'Stairway to Heaven', 
      artist: 'Led Zeppelin', 
      duration: '8:02', 
      addedBy: 'System',
      videoId: 'QkF3oxziUI4',
      thumbnail: 'https://img.youtube.com/vi/QkF3oxziUI4/mqdefault.jpg'
    }
  ],
  users: [],
  currentSong: null,
  isPlaying: false
};
playlists.set('default', defaultPlaylist);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join-playlist', (data) => {
    const { playlistId, username } = data;
    const user = {
      id: socket.id,
      username: username || `User${Math.floor(Math.random() * 1000)}`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    };
    
    users.set(socket.id, user);
    socket.join(playlistId);
    
    // Add user to playlist
    const playlist = playlists.get(playlistId) || defaultPlaylist;
    playlist.users = playlist.users.filter(u => u.id !== socket.id);
    playlist.users.push(user);
    
    // Send current playlist state
    socket.emit('playlist-state', playlist);
    
    // Notify others of new user
    socket.to(playlistId).emit('user-joined', user);
    socket.to(playlistId).emit('users-update', playlist.users);
  });

  // Handle adding songs
  socket.on('add-song', (data) => {
    const { playlistId, song } = data;
    const playlist = playlists.get(playlistId);
    const user = users.get(socket.id);
    
    if (playlist && user) {
      const newSong = {
        ...song,
        id: uuidv4(),
        addedBy: user.username
      };
      
      playlist.songs.push(newSong);
      
      // Broadcast to all users in the playlist
      io.to(playlistId).emit('song-added', newSong);
    }
  });

  // Handle removing songs
  socket.on('remove-song', (data) => {
    const { playlistId, songId } = data;
    const playlist = playlists.get(playlistId);
    
    if (playlist) {
      playlist.songs = playlist.songs.filter(song => song.id !== songId);
      io.to(playlistId).emit('song-removed', songId);
    }
  });

  // Handle reordering songs
  socket.on('reorder-songs', (data) => {
    const { playlistId, songs } = data;
    const playlist = playlists.get(playlistId);
    
    if (playlist) {
      playlist.songs = songs;
      socket.to(playlistId).emit('songs-reordered', songs);
    }
  });

  // Handle user cursor/selection
  socket.on('cursor-update', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(data.playlistId).emit('cursor-update', {
        userId: socket.id,
        username: user.username,
        color: user.color,
        ...data
      });
    }
  });

  // Handle play/pause
  socket.on('play-pause', (data) => {
    const { playlistId, isPlaying, currentSong, currentTime } = data;
    const playlist = playlists.get(playlistId);
    
    if (playlist) {
      playlist.isPlaying = isPlaying;
      playlist.currentSong = currentSong;
      
      io.to(playlistId).emit('playback-state', {
        isPlaying,
        currentSong,
        currentTime
      });
    }
  });

  // Handle song change
  socket.on('change-song', (data) => {
    const { playlistId, songId } = data;
    const playlist = playlists.get(playlistId);
    
    if (playlist) {
      const song = playlist.songs.find(s => s.id === songId);
      if (song) {
        playlist.currentSong = songId;
        playlist.isPlaying = true;
        
        io.to(playlistId).emit('song-changed', {
          currentSong: songId,
          isPlaying: true
        });
      }
    }
  });

  // Handle YouTube search
  socket.on('youtube-search', async (data) => {
    const { query, playlistId } = data;
    
    // For now, return mock results. In production, you'd use YouTube API
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
    ];
    
    socket.emit('youtube-results', mockResults);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      // Remove user from all playlists
      playlists.forEach((playlist) => {
        playlist.users = playlist.users.filter(u => u.id !== socket.id);
        socket.to(playlist.id).emit('user-left', user);
        socket.to(playlist.id).emit('users-update', playlist.users);
      });
      
      users.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 4201;
httpServer.listen(PORT, () => {
  console.log(`🎵 Vibes Playlist app running on http://localhost:${PORT}`);
});