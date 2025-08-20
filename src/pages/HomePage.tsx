import { Component, For, createSignal, createMemo, onMount, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { playlists, currentPlaylistId, getCurrentPlaylistTracks, setCurrentTrack, setCurrentPlaylistId, setIsPlaying, playlistTracks } from '../stores/playlistStore';
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
      <div class="hidden lg:flex w-56 flex-shrink-0 bg-white">
        <div class="p-3 flex flex-col h-full">
          <DiscoveryBar
            playlists={Object.values(playlists)}
            onPlaylistClick={handlePlaylistChange}
            variant="vertical"
          />
        </div>
      </div>
      
      {/* Main Content - Playlist - THE ONLY SCROLLABLE AREA */}
      <div class="flex-1 overflow-y-auto p-3 md:p-6">
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
          <div ref={trackContainerRef!} class="space-y-3" id="playlist-container">
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
                    onPlay={() => setCurrentTrack(track)}
                  />
                )}
              </For>
            )}
          </div>
      </div>
    </div>
  );
};

export default HomePage;