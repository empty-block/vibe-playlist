import { Component, For, createSignal, createMemo, onMount, createEffect } from 'solid-js';
import { getCurrentPlaylistTracks, currentPlaylistId, setCurrentTrack, playlistTracks, setPlayingPlaylistId } from '../../stores/playlistStore';
import TrackItem from './TrackItem';
import { staggeredFadeIn } from '../../utils/animations';

export type SortOption = 'recent' | 'likes' | 'comments';

interface PlaylistProps {
  searchQuery: string;
  sortBy: SortOption;
}

const Playlist: Component<PlaylistProps> = (props) => {
  let trackContainerRef: HTMLDivElement;
  
  const filteredTracks = createMemo(() => {
    let tracks = getCurrentPlaylistTracks();
    
    // Filter by search query
    const query = props.searchQuery.toLowerCase();
    if (query) {
      tracks = tracks.filter(track => 
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.comment.toLowerCase().includes(query) ||
        track.addedBy.toLowerCase().includes(query)
      );
    }
    
    // Sort tracks
    const sortedTracks = [...tracks].sort((a, b) => {
      switch (props.sortBy) {
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
  
  onMount(() => {
    if (trackContainerRef) {
      staggeredFadeIn(trackContainerRef);
    }
  });
  
  createEffect(() => {
    // Re-animate when tracks change significantly
    const tracks = filteredTracks();
    if (trackContainerRef && tracks.length > 0) {
      staggeredFadeIn(trackContainerRef);
    }
  });

  return (
    <div ref={el => trackContainerRef = el} class="space-y-2">
      <For each={filteredTracks()}>
        {(track, index) => (
          <TrackItem 
            track={track} 
            index={index()} 
            playlistId={currentPlaylistId() || ''} 
          />
        )}
      </For>
    </div>
  );
};

export default Playlist;