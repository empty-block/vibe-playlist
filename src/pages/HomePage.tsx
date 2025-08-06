import { Component, For, createSignal, createMemo } from 'solid-js';
import { playlists, currentPlaylistId, setCurrentPlaylistId, getCurrentPlaylistTracks, setCurrentTrack } from '../stores/playlistStore';
import TrackItem from '../components/TrackItem';
import SpotifyConnectButton from '../components/SpotifyConnectButton';
import ChatBot from '../components/ChatBot';

const HomePage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [showChatBot, setShowChatBot] = createSignal(true);
  
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
      {/* ChatBot Sidebar */}
      <ChatBot 
        isVisible={showChatBot()} 
        onToggle={() => setShowChatBot(false)}
      />
      
      {/* Main Content */}
      <div class="flex-1 p-4">
        <div class="win95-panel h-full p-4 overflow-hidden flex flex-col">
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-4">
                {!showChatBot() && (
                  <button
                    onClick={() => setShowChatBot(true)}
                    class="win95-button px-3 py-1 text-black font-bold text-sm"
                    title="Show DJ Bot 95"
                  >
                    <i class="fas fa-robot mr-1"></i>🤖 DJ Bot
                  </button>
                )}
                <h1 class="text-2xl font-bold text-black">
                  {playlists[currentPlaylistId()].icon} {playlists[currentPlaylistId()].name}
                </h1>
                <select 
                  value={currentPlaylistId()} 
                  onChange={(e) => handlePlaylistSelect(e.currentTarget.value)}
                  class="win95-panel px-2 py-1 text-sm font-bold text-black"
                >
                  <For each={Object.values(playlists)}>
                    {(playlist) => (
                      <option value={playlist.id}>
                        {playlist.icon} {playlist.name}
                      </option>
                    )}
                  </For>
                </select>
              </div>
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
          <div class="flex-1 overflow-y-auto overflow-x-hidden space-y-4" id="playlist-container">
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