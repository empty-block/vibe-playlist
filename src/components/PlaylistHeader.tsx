import { Component } from 'solid-js';
import { Playlist } from '../stores/playlistStore';

interface PlaylistHeaderProps {
  playlist: Playlist;
  onCreatorClick: (creatorUsername: string) => void;
  searchQuery?: () => string;
  onSearchInput?: (value: string) => void;
}

const PlaylistHeader: Component<PlaylistHeaderProps> = (props) => {
  return (
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-black mb-2">
        {props.playlist.name}
      </h1>
      <p class="text-sm text-gray-600 mb-4">
        {props.playlist.description}
      </p>
      
      {/* Action Row: Add Track button + Search */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <button
          onClick={() => console.log('Navigate to submit track page')}
          class="win95-button px-4 py-2 text-black font-bold text-sm"
          title="Add a track to this playlist"
        >
          <i class="fas fa-plus mr-2"></i>Add a Track
        </button>
        
        {/* Search Tracks */}
        {props.searchQuery && props.onSearchInput && (
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search tracks..."
              value={props.searchQuery()}
              onInput={(e) => props.onSearchInput!(e.currentTarget.value)}
              class="win95-panel px-2 sm:px-3 py-1 text-xs sm:text-sm flex-1 md:flex-initial md:w-48 lg:w-64"
            />
            <button class="win95-button px-2 sm:px-3 py-1">
              <i class="fas fa-search text-xs sm:text-sm"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistHeader;