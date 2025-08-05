import { Component, For, createSignal, createMemo } from 'solid-js';
import { playlists, currentPlaylistId, setCurrentPlaylistId, getCurrentPlaylistTracks, setCurrentTrack } from '../stores/playlistStore';
import TrackItem from '../components/TrackItem';
import SpotifyConnectButton from '../components/SpotifyConnectButton';

const HomePage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  
  const handlePlaylistSelect = (playlistId: string) => {
    setCurrentPlaylistId(playlistId);
    setSearchQuery(''); // Clear search when switching playlists
  };
  
  const filteredTracks = createMemo(() => {
    const query = searchQuery().toLowerCase();
    if (!query) return getCurrentPlaylistTracks();
    
    return getCurrentPlaylistTracks().filter(track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.comment.toLowerCase().includes(query) ||
      track.addedBy.toLowerCase().includes(query)
    );
  });
  
  return (
    <div class="flex h-full">
      {/* Sidebar */}
      <div class="w-72 win95-panel p-4 m-2 overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-black flex items-center gap-2">
          <i class="fas fa-folder-open text-yellow-600"></i>
          Playlist Explorer
        </h2>
        
        <div class="space-y-2">
          <For each={Object.values(playlists)}>
            {(playlist) => (
              <div 
                class={`win95-button p-3 cursor-pointer transition-all ${
                  currentPlaylistId() === playlist.id ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => handlePlaylistSelect(playlist.id)}
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{playlist.icon}</span>
                  <div class="flex-1">
                    <h3 class="font-bold">{playlist.name}</h3>
                    <p class="text-xs opacity-80">{playlist.trackCount} tracks</p>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      
      {/* Main Content */}
      <div class="flex-1 p-4">
        <div class="win95-panel h-full p-4 overflow-hidden flex flex-col">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <h1 class="text-2xl font-bold text-black">
                {playlists[currentPlaylistId()].icon} {playlists[currentPlaylistId()].name}
              </h1>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="win95-panel px-3 py-1 text-sm w-64"
                />
                <button class="win95-button px-3 py-1">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              {playlists[currentPlaylistId()].description}
            </p>
          </div>
          
          {/* Spotify Connect */}
          <SpotifyConnectButton />
          
          {/* Playlist tracks */}
          <div class="flex-1 overflow-y-auto space-y-3" id="playlist-container">
            {filteredTracks().length === 0 ? (
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-search text-4xl mb-4"></i>
                <p>No tracks found matching "{searchQuery()}"</p>
              </div>
            ) : (
              <For each={filteredTracks()}>
                {(track) => (
                  <TrackItem 
                    track={track} 
                    onPlay={() => setCurrentTrack(track)}
                  />
                )}
              </For>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;