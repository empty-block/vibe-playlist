import { Component, For, createSignal, createMemo, onMount, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { playlists, currentPlaylistId, getCurrentPlaylistTracks, setCurrentTrack, setCurrentPlaylistId, setIsPlaying, playlistTracks, setPlayingPlaylistId } from '../stores/playlistStore';
import TrackItem from '../components/playlist/TrackItem';
import PlaylistHeader from '../components/playlist/PlaylistHeader';
import DiscoveryBar from '../components/common/DiscoveryBar';
import { staggeredFadeIn } from '../utils/animations';

export type SortOption = 'recent' | 'likes' | 'comments';

const HomePage: Component = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal('');
  const [sortBy, setSortBy] = createSignal<SortOption>('recent');
  
  let trackContainerRef: HTMLDivElement;

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
  
  const handleReply = () => {
    console.log('Text reply submitted for playlist:', currentPlaylistId());
    // TODO: Implement actual reply submission to Farcaster
  };

  const handleAddTrack = () => {
    console.log('Track added to playlist:', currentPlaylistId());
    // TODO: Implement actual track addition to Farcaster
    // For now, could also navigate to SharePage as fallback:
    // navigate(`/share?playlist=${currentPlaylistId()}`);
  };
  
  const handlePlayPlaylist = () => {
    const tracks = playlistTracks();
    if (tracks.length > 0) {
      console.log('Playing playlist:', currentPlaylistId());
      setCurrentTrack(tracks[0]); // Play first track
      setPlayingPlaylistId(currentPlaylistId()); // Track which playlist is playing
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

  // Animate track items when they change
  createEffect(() => {
    const tracks = filteredTracks();
    if (trackContainerRef && tracks.length > 0) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        const trackItems = trackContainerRef.querySelectorAll('.win95-button');
        if (trackItems.length > 0) {
          // Reset opacity for stagger animation
          trackItems.forEach(item => {
            (item as HTMLElement).style.opacity = '0';
          });
          staggeredFadeIn(trackItems);
        }
      }, 50);
    }
  });

  return (
    <div 
      class="h-full flex"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}
    >
      {/* Main Content - Playlist - Enhanced zen spacing */}
      <div class="flex-1 overflow-y-auto" style={{ padding: 'var(--zen-space-sm) var(--zen-space-md)' }}>
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
          
          {/* Playlist tracks */}
          <div ref={trackContainerRef!} class="space-y-3" id="playlist-container" style={{ background: 'transparent' }}>
            {filteredTracks().length === 0 ? (
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-search text-4xl mb-4"></i>
                <p>No tracks found matching "{searchQuery()}"</p>
              </div>
            ) : (
              <For each={filteredTracks()}>
                {(track, index) => (
                  <TrackItem 
                    track={track} 
                    trackNumber={index() + 1}
                    onPlay={() => {
                      setCurrentTrack(track);
                      setPlayingPlaylistId(currentPlaylistId()); // Track which playlist is playing
                    }}
                  />
                )}
              </For>
            )}
          </div>
      </div>
      
      {/* Discovery Console - Right Sidebar (Desktop only) - Cyberpunk Redesign */}
      <div 
        class="hidden lg:flex w-60 flex-shrink-0 flex-col"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          'border-left': '1px solid rgba(4, 202, 244, 0.3)',
          'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Console Header */}
        <div 
          class="relative p-4 border-b"
          style={{
            background: 'linear-gradient(145deg, #0d0d0d, #1d1d1d)',
            'border-bottom-color': 'rgba(4, 202, 244, 0.3)',
            'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Subtle scan lines */}
          <div 
            class="absolute inset-0 pointer-events-none opacity-5"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                rgba(4, 202, 244, 0.1) 3px,
                rgba(4, 202, 244, 0.1) 4px
              )`
            }}
          />
          
          {/* Status indicator */}
          <div class="flex items-center gap-2 mb-2">
            <div 
              class="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: '#00f92a',
                'box-shadow': '0 0 6px rgba(0, 249, 42, 0.6)'
              }}
            />
            <span 
              class="text-xs font-mono uppercase tracking-widest"
              style={{
                color: '#04caf4',
                'text-shadow': '0 0 3px rgba(4, 202, 244, 0.5)',
                'font-family': 'Courier New, monospace'
              }}
            >
              DISCOVERY ONLINE
            </span>
          </div>
          
          <h3 
            class="font-mono font-bold text-lg"
            style={{
              color: '#04caf4',
              'text-shadow': '0 0 5px rgba(4, 202, 244, 0.7)',
              'font-family': 'Courier New, monospace',
              'letter-spacing': '0.1em'
            }}
          >
            DISCOVER
          </h3>
          
          <div class="text-xs font-mono mt-1" style={{ color: 'rgba(4, 202, 244, 0.6)' }}>
            {Object.values(playlists).length} ARCHIVES DETECTED
          </div>
        </div>

        {/* All Playlists - Scrollable */}
        <div class="flex-1 overflow-y-auto">
          <div 
            class="p-3 border-b"
            style={{
              'border-bottom-color': 'rgba(4, 202, 244, 0.2)',
              'border-left': '3px solid #04caf4'
            }}
          >
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-list text-xs" style={{ color: '#04caf4' }}></i>
              <span 
                class="text-xs font-mono font-bold uppercase tracking-wide"
                style={{
                  color: '#04caf4',
                  'text-shadow': '0 0 3px rgba(4, 202, 244, 0.6)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                ALL PLAYLISTS
              </span>
            </div>
          </div>
          
          <div class="p-3 space-y-3">
            {Object.values(playlists).map((playlist) => (
              <button
                onClick={() => handlePlaylistChange(playlist.id)}
                class="w-full text-left p-3 rounded transition-all duration-200"
                style={{
                  background: playlist.id === currentPlaylistId() 
                    ? 'rgba(0, 249, 42, 0.1)' 
                    : 'rgba(4, 202, 244, 0.05)',
                  border: playlist.id === currentPlaylistId()
                    ? '1px solid rgba(0, 249, 42, 0.4)'
                    : '1px solid rgba(4, 202, 244, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (playlist.id !== currentPlaylistId()) {
                    e.currentTarget.style.background = 'rgba(4, 202, 244, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(4, 202, 244, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (playlist.id !== currentPlaylistId()) {
                    e.currentTarget.style.background = 'rgba(4, 202, 244, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div class="font-mono font-bold text-sm truncate" style={{ 
                  color: playlist.id === currentPlaylistId() ? '#00f92a' : '#04caf4',
                  'font-family': 'Courier New, monospace'
                }}>
                  {playlist.name}
                </div>
                <div class="text-xs font-mono truncate mt-1" style={{ 
                  color: 'rgba(255, 255, 255, 0.6)' 
                }}>
                  BY {playlist.createdBy}
                </div>
                <div class="text-xs font-mono truncate" style={{ 
                  color: 'rgba(4, 202, 244, 0.7)' 
                }}>
                  {playlist.trackCount} TRACKS
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;