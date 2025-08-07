import { Component, For, createSignal, createMemo } from 'solid-js';
import { playlists, currentPlaylistId, getCurrentPlaylistTracks, setCurrentTrack } from '../stores/playlistStore';
import TrackItem from '../components/TrackItem';
import ChatBot from '../components/ChatBot';
import PlaylistHeader from '../components/PlaylistHeader';

export type SortOption = 'recent' | 'likes' | 'comments';

const HomePage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [showChatBot, setShowChatBot] = createSignal(false);
  const [sortBy, setSortBy] = createSignal<SortOption>('recent');

  const handleCreatorClick = (creatorUsername: string) => {
    console.log('Navigate to creator profile:', creatorUsername);
    // TODO: Implement navigation to creator profile
  };
  
  const filteredTracks = createMemo(() => {
    let tracks = getCurrentPlaylistTracks();
    
    // Filter by search query
    const query = searchQuery().toLowerCase();
    if (query) {
      tracks = tracks.filter(track => 
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.comment.toLowerCase().includes(query) ||
        track.addedBy.toLowerCase().includes(query)
      );
    }
    
    // Sort tracks
    const sortOption = sortBy();
    const sortedTracks = [...tracks].sort((a, b) => {
      switch (sortOption) {
        case 'recent':
          // Parse timestamp for sorting (assuming "X min ago" format)
          const getTimestamp = (timestamp: string) => {
            const match = timestamp.match(/(\d+)\s*(min|hour|day)/);
            if (!match) return 0;
            const value = parseInt(match[1]);
            const unit = match[2];
            if (unit === 'min') return value;
            if (unit === 'hour') return value * 60;
            if (unit === 'day') return value * 1440;
            return 0;
          };
          return getTimestamp(a.timestamp) - getTimestamp(b.timestamp);
        
        case 'likes':
          return b.likes - a.likes;
        
        case 'comments':
          return b.replies - a.replies;
        
        default:
          return 0;
      }
    });
    
    return sortedTracks;
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
          {/* Search and Tools Bar */}
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">Created by</span>
              <button 
                class="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg px-2 py-1 -ml-2"
                onClick={() => handleCreatorClick(playlists[currentPlaylistId()].createdBy)}
                title={`View ${playlists[currentPlaylistId()].createdBy}'s profile`}
              >
                <span class="text-xl">{playlists[currentPlaylistId()].creatorAvatar}</span>
                <span class="text-base text-black hover:text-blue-700 font-bold">{playlists[currentPlaylistId()].createdBy}</span>
              </button>
              <span class="text-gray-400">•</span>
              <span class="text-sm text-gray-500">{playlists[currentPlaylistId()].createdAt}</span>
              {playlists[currentPlaylistId()].isCollaborative && (
                <>
                  <span class="text-gray-400">•</span>
                  <span class="text-sm text-gray-500">
                    <i class="fas fa-users mr-1"></i>
                    {playlists[currentPlaylistId()].memberCount} members
                  </span>
                </>
              )}
            </div>
            <div class="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search tracks in this playlist..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="win95-panel px-3 py-1 text-sm w-64"
              />
              <button class="win95-button px-3 py-1">
                <i class="fas fa-search"></i>
              </button>
              {!showChatBot() && (
                <button
                  onClick={() => setShowChatBot(true)}
                  class="win95-button px-3 py-1 text-black font-bold text-sm"
                  title="Show DJ Bot 95"
                >
                  <i class="fas fa-robot mr-1"></i>🤖 DJ Bot
                </button>
              )}
            </div>
          </div>

          {/* Playlist Info Section */}
          <PlaylistHeader 
            playlist={playlists[currentPlaylistId()]} 
            onCreatorClick={handleCreatorClick}
          />
          
          {/* Sort Options */}
          <div class="mb-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-black">Sort by:</span>
              <select
                value={sortBy()}
                onChange={(e) => setSortBy(e.currentTarget.value as SortOption)}
                class="win95-panel px-2 py-1 text-sm font-bold text-black"
                title="Sort tracks"
              >
                <option value="recent">📅 Most Recent</option>
                <option value="likes">❤️ Most Liked</option>
                <option value="comments">💬 Most Comments</option>
              </select>
            </div>
          </div>
          
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