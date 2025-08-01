class VibesApp {
    constructor() {
        this.socket = io();
        this.playlistId = 'default';
        this.username = '';
        this.currentUser = null;
        this.users = [];
        this.songs = [];
        this.cursors = new Map();
        this.currentSongId = null;
        this.isPlaying = false;
        this.player = null;
        this.playerReady = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketListeners();
        this.initializeYouTubePlayer();
    }

    initializeElements() {
        this.elements = {
            usernameModal: document.getElementById('usernameModal'),
            usernameInput: document.getElementById('usernameInput'),
            joinBtn: document.getElementById('joinBtn'),
            addSongModal: document.getElementById('addSongModal'),
            addSongBtn: document.getElementById('addSongBtn'),
            closeModal: document.getElementById('closeModal'),
            playlistName: document.getElementById('playlistName'),
            songsList: document.getElementById('songsList'),
            songCount: document.getElementById('songCount'),
            usersList: document.getElementById('usersList'),
            usersCount: document.querySelector('.users-count'),
            cursorsContainer: document.getElementById('cursors'),
            playBtn: document.getElementById('playBtn'),
            skipBtn: document.getElementById('skipBtn'),
            youtubeSearchInput: document.getElementById('youtubeSearchInput'),
            youtubeSearchBtn: document.getElementById('youtubeSearchBtn'),
            youtubeResults: document.getElementById('youtubeResults'),
            noVideo: document.getElementById('noVideo'),
            nowPlayingInfo: document.getElementById('nowPlayingInfo')
        };
    }

    setupEventListeners() {
        // Username modal
        this.elements.joinBtn.addEventListener('click', () => this.joinPlaylist());
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinPlaylist();
        });

        // Add song modal
        this.elements.addSongBtn.addEventListener('click', () => this.showAddSongModal());
        this.elements.closeModal.addEventListener('click', () => this.hideAddSongModal());

        // YouTube search
        this.elements.youtubeSearchBtn.addEventListener('click', () => this.searchYouTube());
        this.elements.youtubeSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchYouTube();
        });

        // Playback controls
        this.elements.playBtn.addEventListener('click', () => this.togglePlayback());
        this.elements.skipBtn.addEventListener('click', () => this.skipToNext());

        // Mouse movement for cursors
        document.addEventListener('mousemove', (e) => {
            this.socket.emit('cursor-update', {
                playlistId: this.playlistId,
                x: e.clientX,
                y: e.clientY
            });
        });

        // Click outside modal to close
        this.elements.addSongModal.addEventListener('click', (e) => {
            if (e.target === this.elements.addSongModal) {
                this.hideAddSongModal();
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('playlist-state', (playlist) => {
            this.songs = playlist.songs;
            this.users = playlist.users;
            this.currentSongId = playlist.currentSong;
            this.isPlaying = playlist.isPlaying;
            this.elements.playlistName.textContent = playlist.name;
            this.renderSongs();
            this.renderUsers();
            if (this.currentSongId && this.playerReady) {
                this.playSong(this.currentSongId);
            }
        });

        this.socket.on('song-added', (song) => {
            this.songs.push(song);
            this.renderSongs();
            this.showNotification(`${song.addedBy} added "${song.title}"`);
        });

        this.socket.on('song-removed', (songId) => {
            this.songs = this.songs.filter(song => song.id !== songId);
            this.renderSongs();
            if (this.currentSongId === songId) {
                this.skipToNext();
            }
        });

        this.socket.on('songs-reordered', (songs) => {
            this.songs = songs;
            this.renderSongs();
        });

        this.socket.on('user-joined', (user) => {
            this.showNotification(`${user.username} joined the playlist`);
        });

        this.socket.on('user-left', (user) => {
            this.showNotification(`${user.username} left the playlist`);
            this.cursors.delete(user.id);
            this.renderCursors();
        });

        this.socket.on('users-update', (users) => {
            this.users = users;
            this.renderUsers();
        });

        this.socket.on('cursor-update', (data) => {
            this.cursors.set(data.userId, data);
            this.renderCursors();
        });

        this.socket.on('youtube-results', (results) => {
            this.renderYouTubeResults(results);
        });

        this.socket.on('playback-state', (data) => {
            this.isPlaying = data.isPlaying;
            this.currentSongId = data.currentSong;
            this.updatePlayButton();
            if (this.playerReady && data.currentSong) {
                const song = this.songs.find(s => s.id === data.currentSong);
                if (song) {
                    if (data.isPlaying) {
                        this.player.playVideo();
                    } else {
                        this.player.pauseVideo();
                    }
                }
            }
        });

        this.socket.on('song-changed', (data) => {
            this.currentSongId = data.currentSong;
            this.isPlaying = data.isPlaying;
            if (this.playerReady) {
                this.playSong(data.currentSong);
            }
        });
    }

    joinPlaylist() {
        const username = this.elements.usernameInput.value.trim();
        if (!username) {
            this.elements.usernameInput.focus();
            return;
        }

        this.username = username;
        this.elements.usernameModal.classList.remove('active');
        
        this.socket.emit('join-playlist', {
            playlistId: this.playlistId,
            username: username
        });
    }

    showAddSongModal() {
        this.elements.addSongModal.classList.add('active');
        this.elements.youtubeSearchInput.focus();
    }

    hideAddSongModal() {
        this.elements.addSongModal.classList.remove('active');
        this.elements.youtubeSearchInput.value = '';
        this.elements.youtubeResults.innerHTML = '';
    }

    initializeYouTubePlayer() {
        window.onYouTubeIframeAPIReady = () => {
            this.player = new YT.Player('youtubePlayer', {
                height: '100%',
                width: '100%',
                videoId: '',
                playerVars: {
                    'autoplay': 0,
                    'controls': 1,
                    'rel': 0,
                    'showinfo': 0,
                    'modestbranding': 1
                },
                events: {
                    'onReady': () => {
                        this.playerReady = true;
                        this.elements.noVideo.style.display = 'none';
                    },
                    'onStateChange': (event) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            this.skipToNext();
                        }
                    }
                }
            });
        };
    }

    searchYouTube() {
        const query = this.elements.youtubeSearchInput.value.trim();
        if (!query) return;

        this.elements.youtubeResults.innerHTML = '<div class="loading">Searching...</div>';
        
        this.socket.emit('youtube-search', {
            query,
            playlistId: this.playlistId
        });
    }

    renderYouTubeResults(results) {
        this.elements.youtubeResults.innerHTML = '';
        
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'youtube-result';
            div.innerHTML = `
                <img src="${result.thumbnail}" alt="${result.title}">
                <div class="youtube-result-info">
                    <div class="youtube-result-title">${result.title}</div>
                    <div class="youtube-result-artist">${result.artist}</div>
                    <div class="youtube-result-duration">${result.duration}</div>
                </div>
            `;
            
            div.addEventListener('click', () => {
                this.socket.emit('add-song', {
                    playlistId: this.playlistId,
                    song: result
                });
                this.hideAddSongModal();
            });
            
            this.elements.youtubeResults.appendChild(div);
        });
    }

    togglePlayback() {
        if (!this.currentSongId && this.songs.length > 0) {
            this.playSong(this.songs[0].id);
        } else if (this.currentSongId) {
            this.isPlaying = !this.isPlaying;
            this.socket.emit('play-pause', {
                playlistId: this.playlistId,
                isPlaying: this.isPlaying,
                currentSong: this.currentSongId,
                currentTime: this.player ? this.player.getCurrentTime() : 0
            });
        }
    }

    skipToNext() {
        const currentIndex = this.songs.findIndex(s => s.id === this.currentSongId);
        const nextIndex = (currentIndex + 1) % this.songs.length;
        
        if (this.songs[nextIndex]) {
            this.socket.emit('change-song', {
                playlistId: this.playlistId,
                songId: this.songs[nextIndex].id
            });
        }
    }

    playSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song || !this.player) return;

        this.currentSongId = songId;
        this.isPlaying = true;
        
        if (song.videoId) {
            this.player.loadVideoById(song.videoId);
            this.updateNowPlaying(song);
            this.renderSongs();
            this.updatePlayButton();
        }
    }

    updateNowPlaying(song) {
        this.elements.nowPlayingInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${song.thumbnail}" alt="${song.title}" style="width: 60px; height: 45px; border-radius: 5px;">
                <div>
                    <div style="font-weight: 600; color: white;">${song.title}</div>
                    <div style="color: rgba(255,255,255,0.7);">${song.artist}</div>
                </div>
            </div>
        `;
    }

    updatePlayButton() {
        const icon = this.elements.playBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    removeSong(songId) {
        this.socket.emit('remove-song', {
            playlistId: this.playlistId,
            songId
        });
    }


    renderSongs() {
        this.elements.songCount.textContent = `${this.songs.length} song${this.songs.length !== 1 ? 's' : ''}`;
        
        if (this.songs.length === 0) {
            this.elements.songsList.innerHTML = '<div class="loading">No songs in playlist yet. Add some!</div>';
            return;
        }

        this.elements.songsList.innerHTML = '';
        this.songs.forEach((song, index) => {
            const div = document.createElement('div');
            div.className = 'song-item';
            if (song.id === this.currentSongId) {
                div.classList.add('playing');
            }
            div.draggable = true;
            div.dataset.songId = song.id;
            
            const thumbnailHtml = song.thumbnail ? 
                `<img src="${song.thumbnail}" alt="${song.title}" class="song-thumbnail">` :
                `<div class="song-number">${index + 1}</div>`;
            
            div.innerHTML = `
                ${thumbnailHtml}
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <div class="song-added-by">Added by ${song.addedBy}</div>
                <button class="remove-song" onclick="app.removeSong('${song.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;

            div.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-song')) {
                    this.socket.emit('change-song', {
                        playlistId: this.playlistId,
                        songId: song.id
                    });
                }
            });

            this.elements.songsList.appendChild(div);
        });

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const songItems = this.elements.songsList.querySelectorAll('.song-item');
        
        songItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.songId);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                const targetId = item.dataset.songId;
                
                if (draggedId !== targetId) {
                    this.reorderSongs(draggedId, targetId);
                }
            });
        });
    }

    reorderSongs(draggedId, targetId) {
        const draggedIndex = this.songs.findIndex(song => song.id === draggedId);
        const targetIndex = this.songs.findIndex(song => song.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;

        const newSongs = [...this.songs];
        const [draggedSong] = newSongs.splice(draggedIndex, 1);
        newSongs.splice(targetIndex, 0, draggedSong);

        this.socket.emit('reorder-songs', {
            playlistId: this.playlistId,
            songs: newSongs
        });
    }

    renderUsers() {
        this.elements.usersCount.textContent = `${this.users.length} online`;
        this.elements.usersList.innerHTML = '';

        this.users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-avatar';
            div.style.backgroundColor = user.color;
            div.textContent = user.username.charAt(0).toUpperCase();
            div.title = user.username;
            this.elements.usersList.appendChild(div);
        });
    }

    renderCursors() {
        this.elements.cursorsContainer.innerHTML = '';
        
        this.cursors.forEach((cursor, userId) => {
            const div = document.createElement('div');
            div.className = 'cursor';
            div.style.backgroundColor = cursor.color;
            div.style.left = cursor.x + 'px';
            div.style.top = cursor.y + 'px';
            div.dataset.username = cursor.username;
            div.textContent = cursor.username.charAt(0).toUpperCase();
            this.elements.cursorsContainer.appendChild(div);
        });
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app
const app = new VibesApp();