import { Component, Show } from 'solid-js';
import { Playlist } from '../../stores/playlistStore';

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
        flex-shrink-0 w-52 lg:w-56 xl:w-60 cursor-pointer group transition-all duration-300
        ${props.isCurrentlyPlaying ? 'scale-105' : ''}
      `}
      onClick={props.onClick}
      title={`${props.playlist.name} - ${props.playlist.description}`}
      style={{
        transform: 'translateZ(0)',
        transition: 'none'
      }}
      onMouseEnter={(e) => {
        if (!props.isCurrentlyPlaying) {
          e.currentTarget.style.transform = 'scale(1.03) translateZ(0)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!props.isCurrentlyPlaying) {
          e.currentTarget.style.transform = 'translateZ(0)';
          e.currentTarget.style.filter = 'brightness(1)';
        }
      }}
    >
      {/* Playlist Cover Container */}
      <div 
        class="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: props.isCurrentlyPlaying 
            ? '3px solid #04caf4' 
            : '2px solid rgba(59, 0, 253, 0.2)',
          'box-shadow': props.isCurrentlyPlaying
            ? '0 0 20px rgba(4, 202, 244, 0.5), 0 0 40px rgba(4, 202, 244, 0.3)'
            : '0 4px 15px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Larger thumbnail matching TrackItem style */}
        <div class="relative w-full h-52 lg:h-56 xl:h-60">
          {generateCover()}
          
          {/* Dark gradient overlay for text readability - ALWAYS PRESENT */}
          <div 
            class="absolute inset-x-0 bottom-0 pt-20"
            style={{
              background: `linear-gradient(to top, 
                rgba(0, 0, 0, 0.95) 0%,
                rgba(0, 0, 0, 0.85) 30%,
                rgba(0, 0, 0, 0.6) 60%,
                rgba(0, 0, 0, 0.3) 80%,
                transparent 100%
              )`
            }}
          >
            {/* Text content inside the card overlay */}
            <div class="p-4 pb-3">
              <h4 
                class="font-mono font-bold text-base lg:text-lg truncate mb-1"
                style={{
                  color: props.isCurrentlyPlaying ? '#04caf4' : '#ffffff',
                  'text-shadow': props.isCurrentlyPlaying 
                    ? '0 0 8px rgba(4, 202, 244, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
                    : '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 4px rgba(255, 255, 255, 0.2)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                {props.playlist.name}
              </h4>
              <p 
                class="font-mono text-sm truncate mb-0.5"
                style={{
                  color: '#f906d6',
                  'text-shadow': '0 1px 4px rgba(0, 0, 0, 0.8)',
                  'font-family': 'Courier New, monospace',
                  opacity: 0.9
                }}
              >
                by {props.playlist.creator || 'Anonymous'}
              </p>
              <p 
                class="font-mono text-xs"
                style={{
                  color: 'rgba(211, 246, 10, 0.85)',
                  'text-shadow': '0 1px 3px rgba(0, 0, 0, 0.8)',
                  'font-family': 'Courier New, monospace',
                  opacity: 0.85
                }}
              >
                {props.playlist.trackCount} TRACKS
              </p>
            </div>
          </div>
          
          {/* Now Playing Indicator */}
          <Show when={props.isCurrentlyPlaying}>
            <div 
              class="absolute top-2 right-2 px-2 py-1 rounded-full flex items-center gap-1 z-10"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid #00f92a',
                'box-shadow': '0 0 10px rgba(0, 249, 42, 0.8)',
                'backdrop-filter': 'blur(8px)'
              }}
            >
              <div 
                class="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: '#00f92a',
                  'box-shadow': '0 0 5px #00f92a'
                }}
              />
              <span 
                class="text-xs font-mono font-bold uppercase tracking-wide"
                style={{
                  color: '#00f92a',
                  'text-shadow': '0 0 3px rgba(0, 249, 42, 0.6)'
                }}
              >
                NOW
              </span>
            </div>
          </Show>

        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;