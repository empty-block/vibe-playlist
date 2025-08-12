import { Component, For, createSignal, createMemo, onMount, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { playlists, currentPlaylistId, getCurrentPlaylistTracks, setCurrentTrack, setCurrentPlaylistId, setIsPlaying, playlistTracks } from '../stores/playlistStore';
import TrackItem from '../components/TrackItem';
import PlaylistHeader from '../components/PlaylistHeader';
import DiscoveryBar from '../components/DiscoveryBar';
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
    }
  };

  const handlePlaylistChange = (playlistId: string) => {
    console.log('Switching to playlist:', playlistId);
    setCurrentPlaylistId(playlistId);
    // Optionally auto-play first track of the selected playlist
    const tracks = playlistTracks[playlistId] || [];
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
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
    <div class="h-full flex">
      {/* Discovery Bar - Left Sidebar (Desktop only) - Fixed, no scroll */}
      <div class="hidden lg:flex w-56 flex-shrink-0 bg-white border-r-2 border-gray-300">
        <div class="p-3 flex flex-col h-full">
          <DiscoveryBar
            playlists={Object.values(playlists)}
            onPlaylistClick={handlePlaylistChange}
            variant="vertical"
          />
        </div>
      </div>
      
      {/* Main Content - Playlist - THE ONLY SCROLLABLE AREA */}
      <div class="flex-1 overflow-y-auto p-2 md:p-4">
        <div class="win95-panel p-2 md:p-4">
          {/* Enhanced Playlist Header with Conversation UI */}
          <PlaylistHeader 
            playlist={playlists[currentPlaylistId()]} 
            onCreatorClick={handleCreatorClick}
            searchQuery={searchQuery}
            onSearchInput={setSearchQuery}
            onReply={handleReply}
            onAddTrack={handleAddTrack}
            onPlayPlaylist={handlePlayPlaylist}
          />
          
          {/* Sort Options */}
          <div class="mb-3 md:mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-black">Sort by:</span>
              <select
                value={sortBy()}
                onChange={(e) => setSortBy(e.currentTarget.value as SortOption)}
                class="win95-panel px-1 sm:px-2 py-1 text-xs sm:text-sm font-bold text-black"
                title="Sort tracks"
              >
                <option value="recent">📅 Most Recent</option>
                <option value="likes">❤️ Most Liked</option>
                <option value="comments">💬 Most Comments</option>
              </select>
            </div>
          </div>
          
          {/* Playlist tracks */}
          <div ref={trackContainerRef!} class="space-y-2 px-2" id="playlist-container">
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