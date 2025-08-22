import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying } from '../../stores/playlistStore';
import { canPlayTrack, initiateSpotifyAuth } from '../../stores/authStore';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
  trackNumber: number;
}

const TrackItem: Component<TrackItemProps> = (props) => {
  const [showReplies, setShowReplies] = createSignal(false);
  
  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isPlayable = () => canPlayTrack(props.track.source);
  const isCurrentlyPlaying = () => isCurrentTrack() && isPlaying();
  
  const handlePlay = () => {
    if (!isPlayable()) {
      if (props.track.source === 'spotify') {
        initiateSpotifyAuth();
      }
      return;
    }
    props.onPlay();
  };

  const getSourceBadge = () => {
    const badges = {
      youtube: { icon: 'fab fa-youtube', color: '#ff0000' },
      spotify: { icon: 'fab fa-spotify', color: '#1db954' },
      soundcloud: { icon: 'fab fa-soundcloud', color: '#ff8800' }
    };
    return badges[props.track.source] || { icon: 'fas fa-music', color: '#04caf4' };
  };

  const sourceBadge = getSourceBadge();

  return (
    <div 
      class="relative p-4 rounded-lg transition-all duration-300 group cursor-pointer"
      style={{
        background: isCurrentTrack() 
          ? 'linear-gradient(135deg, rgba(0, 249, 42, 0.08), rgba(4, 202, 244, 0.05))'
          : '#1a1a1a',
        border: isCurrentTrack()
          ? '2px solid rgba(0, 249, 42, 0.8)'
          : '2px solid rgba(4, 202, 244, 0.2)',
        'box-shadow': isCurrentTrack()
          ? '0 0 10px rgba(0, 249, 42, 0.2), 0 0 20px rgba(0, 249, 42, 0.1)'
          : 'none'
      }}
      onClick={handlePlay}
      onMouseEnter={(e) => {
        if (!isCurrentTrack()) {
          e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
          e.currentTarget.style.transform = 'scale(1.01)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrentTrack()) {
          e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <div class="flex items-center gap-4">
        {/* Enhanced Thumbnail with Track Number and Hover Effect */}
        <div class="flex-shrink-0 relative group/thumb">
          <div class="relative">
            <img 
              src={props.track.thumbnail}
              alt={props.track.title}
              class="w-32 h-32 object-cover rounded-lg"
              style={{
                border: '2px solid rgba(4, 202, 244, 0.3)'
              }}
            />
            
            {/* Track Number Badge */}
            <div 
              class="absolute top-2 left-2 w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(4, 202, 244, 0.4)',
                color: isCurrentTrack() ? '#00f92a' : '#04caf4'
              }}
            >
              {props.trackNumber}
            </div>
            
            {/* Hover Play Overlay */}
            <div 
              class="absolute inset-0 opacity-0 group-hover/thumb:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 0, 253, 0.9) 0%, rgba(4, 202, 244, 0.9) 100%)'
              }}
              onClick={handlePlay}
            >
              <Show
                when={isCurrentlyPlaying()}
                fallback={
                  <div 
                    class="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: '2px solid #ffffff',
                      'box-shadow': '0 0 20px rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <i class="fas fa-play text-white text-2xl ml-1"></i>
                  </div>
                }
              >
                <div 
                  class="w-14 h-14 rounded-full flex items-center justify-center animate-pulse"
                  style={{
                    background: 'rgba(0, 249, 42, 0.9)',
                    border: '2px solid #00f92a',
                    'box-shadow': '0 0 20px rgba(0, 249, 42, 0.8)'
                  }}
                >
                  <i class="fas fa-volume-up text-black text-2xl"></i>
                </div>
              </Show>
            </div>
          </div>
        </div>

        {/* Track Info */}
        <div class="flex-1 min-w-0">

          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h3 
                class="font-bold text-xl mb-2 truncate"
                style={{
                  color: isCurrentTrack() ? '#00f92a' : '#ffffff'
                }}
              >
                {props.track.title}
              </h3>
              <p 
                class="text-lg truncate"
                style={{
                  color: 'rgba(4, 202, 244, 0.8)'
                }}
              >
                {props.track.artist}
              </p>
              <Show when={props.track.comment}>
                <p 
                  class="text-base mt-3 line-clamp-2"
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  {props.track.comment}
                </p>
              </Show>
            </div>

            {/* Source Badge */}
            <div 
              class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
              style={{
                background: `${sourceBadge.color}20`,
                border: `1px solid ${sourceBadge.color}40`,
                color: sourceBadge.color
              }}
            >
              <i class={sourceBadge.icon}></i>
              <span class="hidden sm:inline">{props.track.source}</span>
            </div>
          </div>

          {/* Track Metadata */}
          <div class="flex items-center justify-between mt-4 text-base">
            <div class="flex items-center gap-4">
              <span style={{ color: 'rgba(249, 6, 214, 0.7)' }}>
                <i class="fas fa-user mr-1"></i>
                {props.track.addedBy}
              </span>
              <span style={{ color: 'rgba(255, 155, 0, 0.7)' }}>
                <i class="fas fa-clock mr-1"></i>
                {props.track.timestamp}
              </span>
              <button
                onClick={() => setShowReplies(!showReplies())}
                class="transition-colors"
                style={{ 
                  color: showReplies() ? '#04caf4' : 'rgba(4, 202, 244, 0.7)' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#04caf4';
                }}
                onMouseLeave={(e) => {
                  if (!showReplies()) {
                    e.currentTarget.style.color = 'rgba(4, 202, 244, 0.7)';
                  }
                }}
              >
                <i class="fas fa-comment mr-1"></i>
                {props.track.replies} replies
              </button>
              <span style={{ color: 'rgba(0, 249, 42, 0.7)' }}>
                <i class="fas fa-heart mr-1"></i>
                {props.track.likes} likes
              </span>
            </div>

            {/* Retro Radio-Style READY Display - Bottom Right */}
            <div 
              class="relative px-4 py-3 rounded"
              style={{
                background: 'linear-gradient(145deg, #0d0d0d, #1d1d1d)',
                border: '1px solid rgba(4, 202, 244, 0.3)',
                'box-shadow': 'inset 0 0 10px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Retro scan lines */}
              <div 
                class="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    transparent 1px,
                    rgba(4, 202, 244, 0.1) 2px,
                    rgba(4, 202, 244, 0.1) 3px
                  )`
                }}
              />
              
              <div class="relative flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  style={{
                    background: isCurrentlyPlaying() ? '#00f92a' : (isCurrentTrack() ? '#ff9b00' : (isPlayable() ? '#04caf4' : '#f906d6')),
                    'box-shadow': isCurrentlyPlaying() 
                      ? '0 0 6px rgba(0, 249, 42, 0.8)' 
                      : (isCurrentTrack() ? '0 0 4px rgba(255, 155, 0, 0.6)' : 'none'),
                    animation: isCurrentlyPlaying() ? 'pulse 2s infinite' : 'none'
                  }}
                />
                <span 
                  class="text-base font-mono font-bold uppercase tracking-widest"
                  style={{
                    color: isCurrentlyPlaying() ? '#00f92a' : (isCurrentTrack() ? '#ff9b00' : (isPlayable() ? '#04caf4' : '#f906d6')),
                    'text-shadow': isCurrentlyPlaying() 
                      ? '0 0 3px rgba(0, 249, 42, 0.6)' 
                      : (isCurrentTrack() ? '0 0 3px rgba(255, 155, 0, 0.4)' : '0 0 2px rgba(4, 202, 244, 0.4)'),
                    'font-family': 'Courier New, monospace',
                    'font-size': '14px'
                  }}
                >
                  {isCurrentlyPlaying() ? 'PLAYING' : (isCurrentTrack() ? 'LOADED' : (isPlayable() ? 'READY' : 'AUTH'))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Replies Section */}
      <Show when={showReplies()}>
        <div 
          class="mt-4 pt-4"
          style={{
            'border-top': '1px solid rgba(4, 202, 244, 0.2)'
          }}
        >
          <p 
            class="text-xs text-center"
            style={{ color: 'rgba(4, 202, 244, 0.6)' }}
          >
            Discussion replies will appear here
          </p>
        </div>
      </Show>
    </div>
  );
};

export default TrackItem;