import { Component, Show } from 'solid-js';
import { Playlist } from '../stores/playlistStore';

interface PlaylistCardProps {
  playlist: Playlist;
  isCurrentlyPlaying?: boolean;
  tracks?: Array<{ thumbnail: string; title: string }>;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

const PlaylistCard: Component<PlaylistCardProps> = (props) => {
  const isCompact = () => props.variant === 'compact';
  // Generate playlist cover from first 4 track thumbnails
  const generateCover = () => {
    if (!props.tracks || props.tracks.length === 0) {
      // Fallback: gradient based on playlist color
      return (
        <div 
          class="w-full h-full flex items-center justify-center text-white text-2xl rounded"
          style={{
            background: `linear-gradient(135deg, ${props.playlist.color} 0%, ${props.playlist.color}80 100%)`
          }}
        >
          {props.playlist.icon}
        </div>
      );
    }

    // Use track thumbnails in a 2x2 grid
    const displayTracks = props.tracks.slice(0, 4);
    
    if (displayTracks.length === 1) {
      return (
        <img
          src={displayTracks[0].thumbnail}
          alt={`${props.playlist.name} cover`}
          class="w-full h-full object-cover rounded"
        />
      );
    }

    return (
      <div class="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 rounded overflow-hidden">
        {displayTracks.map((track, index) => (
          <img
            key={index}
            src={track.thumbnail}
            alt={track.title}
            class="w-full h-full object-cover"
          />
        ))}
        {/* Fill empty slots with gradient */}
        {Array.from({ length: Math.max(0, 4 - displayTracks.length) }).map((_, index) => (
          <div 
            key={`empty-${index}`}
            class="w-full h-full flex items-center justify-center text-white text-xs"
            style={{
              background: `linear-gradient(135deg, ${props.playlist.color}40 0%, ${props.playlist.color}20 100%)`
            }}
          >
            {props.playlist.icon}
          </div>
        ))}
      </div>
    );
  };

  if (isCompact()) {
    // Compact horizontal layout for Discovery sidebar
    return (
      <div 
        class={`
          w-full cursor-pointer group transition-all duration-200 hover:bg-gray-50 rounded p-2
          ${props.isCurrentlyPlaying ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'}
        `}
        onClick={props.onClick}
        title={`${props.playlist.name} - ${props.playlist.description}`}
      >
        <div class="flex items-center gap-3">
          {/* Small thumbnail */}
          <div class="relative w-12 h-12 flex-shrink-0">
            {generateCover()}
            
            {/* Now Playing Indicator */}
            <Show when={props.isCurrentlyPlaying}>
              <div class="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                <i class="fas fa-play text-xs"></i>
              </div>
            </Show>
          </div>
          
          {/* Playlist Info */}
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-black truncate leading-tight">
              {props.playlist.name}
            </h4>
            <p class="text-xs text-gray-600 truncate">
              {props.playlist.trackCount} tracks
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default card layout (for horizontal discovery bar)
  return (
    <div 
      class={`
        flex-shrink-0 w-28 lg:w-auto cursor-pointer group transition-transform duration-200 hover:scale-105
        ${props.isCurrentlyPlaying ? 'border-2 border-blue-400 rounded-lg p-1' : ''}
      `}
      onClick={props.onClick}
      title={`${props.playlist.name} - ${props.playlist.description}`}
    >
      {/* Playlist Cover */}
      <div class="relative w-full h-24 sm:h-28 mb-2">
        {generateCover()}
        
        {/* Now Playing Indicator */}
        <Show when={props.isCurrentlyPlaying}>
          <div class="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
            <i class="fas fa-play text-xs"></i>
            <span class="text-xs">Now</span>
          </div>
        </Show>

        {/* Hover overlay effect */}
        <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded"></div>
      </div>

      {/* Playlist Info */}
      <div class="text-center">
        <h4 class="text-xs font-bold text-black truncate mb-1">
          {props.playlist.name}
        </h4>
        <p class="text-xs text-gray-600 truncate">
          {props.playlist.trackCount} tracks
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;