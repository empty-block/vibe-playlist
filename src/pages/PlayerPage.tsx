import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { playlists, currentPlaylistId, setCurrentTrack, setCurrentPlaylistId, playlistTracks, setPlayingPlaylistId } from '../stores/playlistStore';
import Playlist, { SortOption } from '../components/playlist/Playlist';
import PlaylistHeader from '../components/playlist/PlaylistHeader';
import DiscoveryBar from '../components/common/DiscoveryBar';

const PlayerPage: Component = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal('');
  const [sortBy, setSortBy] = createSignal<SortOption>('recent');

  const handleCreatorClick = (creatorUsername: string) => {
    console.log('Navigate to creator profile:', creatorUsername);
    navigate(`/profile/${creatorUsername}`);
  };
  
  const handleReply = () => {
    console.log('Text reply submitted for playlist:', currentPlaylistId());
    // TODO: Implement actual reply submission to Farcaster
  };

  const handleAddTrack = () => {
    console.log('Track added to playlist:', currentPlaylistId());
    // TODO: Implement actual track addition to Farcaster
    // For now, could also navigate to CreatePage as fallback:
    // navigate(`/create?playlist=${currentPlaylistId()}`);
  };
  
  const handlePlayPlaylist = () => {
    const currentId = currentPlaylistId();
    const tracks = playlistTracks[currentId || ''] || [];
    if (tracks.length > 0) {
      console.log('Playing playlist:', currentId);
      setCurrentTrack(tracks[0]); // Play first track
      setPlayingPlaylistId(currentId); // Track which playlist is playing
    }
  };

  const handlePlaylistChange = (playlistId: string) => {
    console.log('Switching to playlist:', playlistId);
    setCurrentPlaylistId(playlistId);
    // Optionally auto-play first track of the selected playlist
    const tracks = playlistTracks[playlistId] || [];
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setPlayingPlaylistId(playlistId); // Track which playlist is playing
    }
  };


  return (
    <div 
      class="min-h-screen"
      style={{ 
        background: '#0f0f0f'
      }}
    >
      <div class="p-4 md:p-6 max-w-7xl mx-auto">
        {/* PLAYLIST HEADER - Clean Section Style */}
        <div 
          class="mb-6 p-4 pl-6 border-l-4"
          style={{
            'border-color': '#00f92a'
          }}
        >
          <h1 
            class="font-bold text-2xl lg:text-3xl"
            style={{
              color: '#f906d6',
              'text-shadow': '0 0 8px rgba(249, 6, 214, 0.7)',
              'letter-spacing': '0.1em'
            }}
          >
            {playlists[currentPlaylistId()]?.name || 'Loading...'}
          </h1>
        </div>

        {/* Enhanced Playlist Header with Conversation UI */}
        <PlaylistHeader 
          playlist={playlists[currentPlaylistId()]} 
          onCreatorClick={handleCreatorClick}
          searchQuery={searchQuery}
          onSearchInput={setSearchQuery}
          sortBy={sortBy}
          onSortChange={(value) => setSortBy(value as SortOption)}
          onReply={handleReply}
          onAddTrack={handleAddTrack}
          onPlayPlaylist={handlePlayPlaylist}
        />
        
        {/* TRACK LIST SECTION */}
        <div 
          class="mb-8"
          style={{ 
            'margin-bottom': '84px'
          }}
        >
          <div 
            class="mb-6 pl-4 border-l-4"
            style={{
              'border-color': '#04caf4'
            }}
          >
            <h2 
              class="font-bold text-lg md:text-xl lg:text-2xl mb-1"
              style={{
                color: '#ffffff'
              }}
            >
              <i class="fas fa-music mr-3 text-base" style={{ color: '#04caf4' }}></i>
              Tracks
            </h2>
          </div>
          
          {/* Playlist Component */}
          <Playlist 
            searchQuery={searchQuery()} 
            sortBy={sortBy()} 
          />
        </div>

        {/* DISCOVER MORE SECTION */}
        <div class="mb-8">
          <div 
            class="mb-6 pl-4 border-l-4"
            style={{
              'border-color': '#f906d6'
            }}
          >
            <h2 
              class="font-bold text-lg md:text-xl lg:text-2xl mb-1"
              style={{
                color: '#ffffff'
              }}
            >
              <i class="fas fa-compass mr-3 text-base" style={{ color: '#f906d6' }}></i>
              Discover More Playlists
            </h2>
            <p 
              class="text-sm"
              style={{
                color: 'rgba(249, 6, 214, 0.7)'
              }}
            >
              Explore other music collections
            </p>
          </div>
          
          {/* Discovery Bar Component */}
          <DiscoveryBar
            playlists={Object.values(playlists).filter(p => p.id !== currentPlaylistId())}
            onPlaylistClick={handlePlaylistChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;