import { Component, createSignal, Show, createMemo, For, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { Track, currentTrack, Reply } from '../../stores/playlistStore';
import { canPlayTrack, isSpotifyAuthenticated, initiateSpotifyAuth } from '../../stores/authStore';
import ReplyItem from '../social/ReplyItem';
import AnimatedButton from '../common/AnimatedButton';
import ReplyForm from '../common/ReplyForm';
import { slideIn, staggeredFadeIn, playbackButtonHover, particleBurst, magnetic } from '../../utils/animations';
import { getThemeColors, getNeonGlow } from '../../utils/contrastColors';
import anime from 'animejs';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
  trackNumber: number;
}

const TrackItem: Component<TrackItemProps> = (props) => {
  let trackItemRef: HTMLDivElement | undefined;
  let playButtonRef: HTMLButtonElement | undefined;
  let thumbnailRef: HTMLImageElement | undefined;

  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isPlayable = () => canPlayTrack(props.track.source);
  
  const [showDiscussion, setShowDiscussion] = createSignal(false);
  const [replySort, setReplySort] = createSignal<'recent' | 'likes'>('recent');
  
  // Get contrast-safe theme colors
  const colors = getThemeColors();

  onMount(() => {
    // Add cyberpunk hover animations for playable tracks
    if (trackItemRef && isPlayable()) {
      trackItemRef.addEventListener('mouseenter', () => {
        anime({
          targets: trackItemRef,
          scale: 1.02,
          duration: 300,
          easing: 'easeOutCubic'
        });
        
        // Add subtle neon border glow on hover
        if (!isCurrentTrack()) {
          trackItemRef.style.borderColor = 'rgba(4, 202, 244, 0.5)';
          trackItemRef.style.boxShadow = '0 4px 20px rgba(4, 202, 244, 0.2), 0 2px 10px rgba(0, 0, 0, 0.3)';
        }
      });

      trackItemRef.addEventListener('mouseleave', () => {
        if (!isCurrentTrack()) {
          anime({
            targets: trackItemRef,
            scale: 1,
            duration: 250,
            easing: 'easeOutQuad'
          });
          
          trackItemRef.style.borderColor = 'rgba(4, 202, 244, 0.3)';
          trackItemRef.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        }
      });
    }

    // Add gradient hover effect to play button
    if (playButtonRef && isPlayable()) {
      playButtonRef.addEventListener('mouseenter', () => {
        playbackButtonHover.enter(playButtonRef);
      });

      playButtonRef.addEventListener('mouseleave', () => {
        playbackButtonHover.leave(playButtonRef);
      });

      playButtonRef.addEventListener('click', (e) => {
        e.stopPropagation();
        particleBurst(playButtonRef);
        props.onPlay();
      });
    }

    // Add magnetic effect to thumbnail
    if (thumbnailRef) {
      magnetic(thumbnailRef, 15);
    }
  });
  
  // Source badge configuration
  const getSourceInfo = (source: string) => {
    switch (source) {
      case 'youtube':
        return { icon: '▶️', label: 'YouTube' };
      case 'spotify':
        return { icon: '🎵', label: 'Spotify' };
      case 'soundcloud':
        return { icon: '☁️', label: 'SoundCloud' };
      default:
        return { icon: '🎵', label: source };
    }
  };

  // Mock replies data
  const mockReplies: Reply[] = [
    {
      id: '1',
      username: 'grunge_fan_93',
      userAvatar: '🎸',
      comment: 'This song literally defined my teenage years! Still gives me chills every time. 🔥',
      timestamp: '5 min ago',
      likes: 12
    },
    {
      id: '2', 
      username: 'radiohead_stan',
      userAvatar: '👁️',
      comment: 'Agreed! This was before they went all experimental. Pure raw emotion.',
      timestamp: '8 min ago',
      likes: 8
    },
    {
      id: '3',
      username: 'music_lover_95',
      userAvatar: '🌟',
      comment: 'The guitar tone on this is INSANE. Kurt knew how to make a Mustang sing! 🎸✨',
      timestamp: '12 min ago',
      likes: 5
    }
  ];

  const sortedReplies = createMemo(() => {
    const sorted = [...mockReplies].sort((a, b) => {
      if (replySort() === 'likes') {
        return b.likes - a.likes;
      } else {
        // Sort by recent
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
      }
    });
    return sorted;
  });
  
  const handleClick = () => {
    if (isPlayable()) {
      props.onPlay();
    }
  };
  
  const sourceInfo = getSourceInfo(props.track.source);
  
  return (
    <div 
      ref={trackItemRef!}
      class={`track-item transition-all duration-300 ${
        isPlayable() 
          ? 'cursor-pointer' 
          : 'cursor-not-allowed opacity-60'
      }`}
      style={{
        padding: '12px',
        margin: '12px 0',
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        border: isCurrentTrack() 
          ? '2px solid transparent' 
          : '1px solid rgba(4, 202, 244, 0.3)',
        'background-image': isCurrentTrack() 
          ? 'linear-gradient(45deg, #3b00fd, #04caf4, #00f92a, #f906d6), linear-gradient(145deg, #1a1a1a, #2a2a2a)'
          : 'none',
        'background-origin': 'border-box',
        'background-clip': isCurrentTrack() ? 'padding-box, border-box' : 'padding-box',
        'border-radius': '12px',
        'box-shadow': isCurrentTrack() 
          ? '0 0 15px rgba(59, 0, 253, 0.3), 0 0 30px rgba(4, 202, 244, 0.2), inset 0 0 10px rgba(0, 249, 42, 0.05)'
          : '0 2px 10px rgba(0, 0, 0, 0.2)',
        transform: 'translateZ(0)',
        transition: 'none'
      }}
      onClick={handleClick}
    >
      {/* FLOWING SINGLE-COLUMN LAYOUT */}
      <div class="space-y-4">
        
        {/* RETRO DIGITAL RADIO DISPLAY */}
        <div class="w-full max-w-2xl mx-auto">
          {/* Retro Radio Display Container */}
          <div 
            class="relative p-4 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              border: '2px solid rgba(4, 202, 244, 0.3)',
              'box-shadow': `
                inset 0 0 20px rgba(0, 0, 0, 0.8),
                inset 0 2px 0 rgba(255, 255, 255, 0.1),
                inset 0 -2px 0 rgba(0, 0, 0, 0.5),
                0 0 20px rgba(4, 202, 244, 0.2)
              `
            }}
          >
            {/* Retro Scan Lines Effect */}
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
            
            {/* Digital Display Header */}
            <div 
              class="flex items-center justify-between mb-3 px-2 py-1 rounded"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(4, 202, 244, 0.4)'
              }}
            >
              <div class="flex items-center gap-2">
                <div 
                  class="w-2 h-2 rounded-full"
                  style={{
                    background: isCurrentTrack() ? '#00f92a' : '#f906d6',
                    'box-shadow': isCurrentTrack() 
                      ? '0 0 8px #00f92a' 
                      : '0 0 6px #f906d6'
                  }}
                />
                <span 
                  class="text-xs font-mono uppercase tracking-widest"
                  style={{
                    color: '#04caf4',
                    'text-shadow': '0 0 5px rgba(4, 202, 244, 0.8)'
                  }}
                >
                  {isCurrentTrack() ? 'NOW PLAYING' : 'TRACK ' + props.trackNumber.toString().padStart(2, '0')}
                </span>
              </div>
              <span class="text-lg">{sourceInfo.icon}</span>
            </div>

            {/* Horizontal Layout for Album Art + Track Info */}
            <div class="flex gap-4">
              {/* Album Art with Retro Frame */}
              <div class="relative group flex-shrink-0 w-40">
                <div 
                  class="p-1 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #333, #111)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    'box-shadow': 'inset 0 0 10px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  <img 
                    ref={thumbnailRef!}
                    src={props.track.thumbnail} 
                    alt={props.track.title}
                    class="w-full aspect-square object-cover rounded"
                    style={{
                      filter: 'contrast(1.1) saturate(1.2)'
                    }}
                  />
                  
                  {/* Track Number Badge */}
                  <div 
                    class="absolute -top-2 -left-2 w-8 h-8 flex items-center justify-center z-10"
                    style={{
                      background: 'linear-gradient(145deg, #000, #333)',
                      'border-radius': '50%',
                      border: '2px solid #04caf4',
                      'box-shadow': '0 0 10px rgba(4, 202, 244, 0.5)',
                      'backdrop-filter': 'blur(4px)'
                    }}
                  >
                    <span 
                      class="text-white font-bold text-sm font-mono"
                      style={{
                        'text-shadow': '0 0 5px rgba(4, 202, 244, 0.8)',
                        color: '#04caf4'
                      }}
                    >
                      {props.trackNumber}
                    </span>
                  </div>
                  
                  {/* Play Button Overlay */}
                  {isPlayable() && (
                    <button
                      ref={playButtonRef!}
                      onClick={props.onPlay}
                      class="absolute inset-0 flex items-center justify-center rounded transition-all duration-300"
                      title="Play this track"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(4, 202, 244, 0) 0%, rgba(0, 249, 42, 0) 50%, rgba(249, 6, 214, 0) 100%)',
                        transition: 'background 300ms'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(4, 202, 244, 0.8) 0%, rgba(0, 249, 42, 0.8) 50%, rgba(249, 6, 214, 0.8) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(4, 202, 244, 0) 0%, rgba(0, 249, 42, 0) 50%, rgba(249, 6, 214, 0) 100%)';
                      }}
                    >
                      <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 border-2 border-white/40">
                        <i class="fas fa-play text-white ml-1 text-lg drop-shadow-lg"></i>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Digital Readout Display */}
              <div 
                class="flex-1 p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(4, 202, 244, 0.3)',
                  'box-shadow': 'inset 0 0 10px rgba(0, 0, 0, 0.8)'
                }}
              >
                {/* Track Title - LCD Style */}
                <div class="mb-2">
                  <div 
                    class="text-xs font-mono uppercase tracking-wide mb-1"
                    style={{
                      color: 'rgba(4, 202, 244, 0.6)',
                      'text-shadow': '0 0 3px rgba(4, 202, 244, 0.4)'
                    }}
                  >
                    TITLE
                  </div>
                  <div 
                    class="font-mono font-bold text-lg leading-tight"
                    style={{
                      color: isCurrentTrack() ? '#00f92a' : '#04caf4',
                      'text-shadow': isCurrentTrack() 
                        ? '0 0 8px rgba(0, 249, 42, 0.8)' 
                        : '0 0 5px rgba(4, 202, 244, 0.6)',
                      'font-family': 'Courier New, monospace'
                    }}
                  >
                    {props.track.title || 'UNKNOWN TITLE'}
                  </div>
                </div>

                {/* Artist - LCD Style */}
                <div class="mb-2">
                  <div 
                    class="text-xs font-mono uppercase tracking-wide mb-1"
                    style={{
                      color: 'rgba(249, 6, 214, 0.6)',
                      'text-shadow': '0 0 3px rgba(249, 6, 214, 0.4)'
                    }}
                  >
                    ARTIST
                  </div>
                  <div 
                    class="font-mono font-semibold text-base"
                    style={{
                      color: '#f906d6',
                      'text-shadow': '0 0 5px rgba(249, 6, 214, 0.6)',
                      'font-family': 'Courier New, monospace'
                    }}
                  >
                    {props.track.artist}
                  </div>
                </div>

                {/* Duration & Status Row - LCD Style */}
                <div class="flex justify-between items-center">
                  <div>
                    <div 
                      class="text-xs font-mono uppercase tracking-wide mb-1"
                      style={{
                        color: 'rgba(211, 246, 10, 0.6)',
                        'text-shadow': '0 0 3px rgba(211, 246, 10, 0.4)'
                      }}
                    >
                      DURATION
                    </div>
                    <div 
                      class="font-mono font-bold text-sm"
                      style={{
                        color: '#d1f60a',
                        'text-shadow': '0 0 5px rgba(211, 246, 10, 0.6)',
                        'font-family': 'Courier New, monospace',
                        'letter-spacing': '0.1em'
                      }}
                    >
                      {props.track.duration}
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div class="text-right">
                    <div 
                      class="text-xs font-mono uppercase tracking-wide mb-1"
                      style={{
                        color: 'rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      STATUS
                    </div>
                    <div 
                      class="font-mono font-bold text-xs px-2 py-1 rounded"
                      style={{
                        color: isPlayable() ? '#00f92a' : '#ff4444',
                        background: isPlayable() ? 'rgba(0, 249, 42, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                        border: isPlayable() ? '1px solid rgba(0, 249, 42, 0.3)' : '1px solid rgba(255, 68, 68, 0.3)',
                        'text-shadow': isPlayable() 
                          ? '0 0 5px rgba(0, 249, 42, 0.6)' 
                          : '0 0 5px rgba(255, 68, 68, 0.6)'
                      }}
                    >
                      {isPlayable() ? 'READY' : 'AUTH REQ'}
                    </div>
                  </div>
                </div>

                {/* Spotify Connect Button - If needed */}
                <Show when={props.track.source === 'spotify' && !isSpotifyAuthenticated()}>
                  <button
                    class="w-full mt-3 px-4 py-2 text-sm font-bold font-mono border-2 transition-all duration-200 rounded"
                    style={{
                      background: 'linear-gradient(145deg, #dfdfdf, #c0c0c0)',
                      'border-color': '#00f92a',
                      color: 'black',
                      'box-shadow': `inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, 0 0 8px #00f92a40`,
                      'min-height': '36px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateSpotifyAuth();
                    }}
                    title="Connect Spotify to play this track"
                  >
                    🔗 CONNECT SPOTIFY
                  </button>
                </Show>
              </div>
            </div>
          </div>
        </div>

        {/* USER ATTRIBUTION & SOCIAL STATS SECTION */}
        <div 
          class="p-4 rounded-xl max-w-2xl mx-auto w-full"
          style={{
            background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
            border: '2px solid rgba(249, 6, 214, 0.3)',
            'box-shadow': '0 4px 20px rgba(249, 6, 214, 0.1)'
          }}
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            {/* User Info */}
            <div class="flex flex-wrap items-center gap-3">
              <span 
                class="text-sm font-medium"
                style={{ color: colors.muted }}
              >
                Added by
              </span>
              <A 
                href={`/profile/${props.track.addedBy}`}
                class="font-bold transition-all duration-300 px-3 py-2 rounded-lg cursor-pointer text-lg"
                style={{
                  color: colors.info,
                  'text-shadow': `0 0 5px ${colors.info}40`,
                  background: 'rgba(102, 179, 255, 0.1)',
                  border: `2px solid ${colors.info}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.success;
                  e.currentTarget.style.textShadow = `0 0 8px ${colors.success}60`;
                  e.currentTarget.style.background = 'rgba(76, 175, 80, 0.15)';
                  e.currentTarget.style.borderColor = `${colors.success}60`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.info;
                  e.currentTarget.style.textShadow = `0 0 5px ${colors.info}40`;
                  e.currentTarget.style.background = 'rgba(102, 179, 255, 0.1)';
                  e.currentTarget.style.borderColor = `${colors.info}40`;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {props.track.addedBy}
              </A>
              <span class="text-base" style={{ color: colors.muted }}>•</span>
              <span class="text-sm" style={{ color: colors.muted }}>{props.track.timestamp}</span>
            </div>

            {/* Social Stats */}
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <i 
                  class="fas fa-heart"
                  style={{
                    color: '#f906d6',
                    'text-shadow': '0 0 5px rgba(249, 6, 214, 0.6)'
                  }}
                ></i>
                <span 
                  class="font-bold"
                  style={{
                    color: '#f906d6',
                    'text-shadow': '0 0 5px rgba(249, 6, 214, 0.6)'
                  }}
                >
                  {props.track.likes || 3}
                </span>
                <span class="text-sm" style={{ color: colors.muted }}>likes</span>
              </div>
              <span class="text-base" style={{ color: colors.muted }}>•</span>
              <div class="flex items-center gap-2">
                <i 
                  class="fas fa-comment"
                  style={{
                    color: '#04caf4',
                    'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)'
                  }}
                ></i>
                <span 
                  class="font-bold"
                  style={{
                    color: '#04caf4',
                    'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)'
                  }}
                >
                  {mockReplies.length}
                </span>
                <span class="text-sm" style={{ color: colors.muted }}>replies</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS SECTION */}
        <div 
          class="p-4 rounded-xl max-w-2xl mx-auto w-full"
          style={{
            background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
            border: '2px solid rgba(4, 202, 244, 0.3)',
            'box-shadow': '0 4px 20px rgba(4, 202, 244, 0.1)'
          }}
        >
          <div class="flex flex-wrap gap-4 justify-center">
            {/* Discussion button */}
            <button
              onClick={() => setShowDiscussion(!showDiscussion())}
              class="relative overflow-hidden font-bold transition-all duration-300 flex-1 min-w-[140px]"
              style={{
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: `2px solid ${colors.info}40`,
                background: showDiscussion() 
                  ? `linear-gradient(145deg, rgba(102, 179, 255, 0.2), rgba(42, 42, 42, 0.8))` 
                  : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                color: showDiscussion() ? colors.info : colors.body,
                minHeight: '48px',
                'box-shadow': showDiscussion() 
                  ? `0 0 15px ${colors.info}40, 0 0 30px ${colors.info}20`
                  : '0 3px 12px rgba(0, 0, 0, 0.3)',
                'text-shadow': showDiscussion() 
                  ? `0 0 5px ${colors.info}60`
                  : 'none'
              }}
              title={showDiscussion() ? "Hide discussion" : "Join discussion"}
              onMouseEnter={(e) => {
                if (!showDiscussion()) {
                  e.currentTarget.style.borderColor = `${colors.info}80`;
                  e.currentTarget.style.boxShadow = `0 0 15px ${colors.info}40, 0 0 30px ${colors.info}20`;
                  e.currentTarget.style.color = colors.info;
                  e.currentTarget.style.textShadow = `0 0 5px ${colors.info}60`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showDiscussion()) {
                  e.currentTarget.style.borderColor = `${colors.info}40`;
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.color = colors.body;
                  e.currentTarget.style.textShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <i class="fas fa-comments mr-2"></i>
              <span>{showDiscussion() ? 'Hide Discussion' : 'Join Discussion'}</span>
            </button>
            
            <button
              onClick={() => console.log('Like track')}
              class="relative overflow-hidden font-bold transition-all duration-300 flex-1 min-w-[120px]"
              style={{
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: `2px solid ${colors.error}40`,
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                color: colors.body,
                minHeight: '48px',
                'box-shadow': '0 3px 12px rgba(0, 0, 0, 0.3)'
              }}
              title="Like this track"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${colors.error}80`;
                e.currentTarget.style.boxShadow = `0 0 15px ${colors.error}40, 0 0 30px ${colors.error}20`;
                e.currentTarget.style.color = colors.error;
                e.currentTarget.style.textShadow = `0 0 5px ${colors.error}60`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${colors.error}40`;
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.color = colors.body;
                e.currentTarget.style.textShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i class="fas fa-heart mr-2"></i>
              <span>Like Track</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Unified Discussion Panel - Three-section layout with neon accents */}
      <Show when={showDiscussion()}>
        <div class="mt-4 rounded-lg overflow-hidden">
          {/* Section 1: Original Post (if exists) - Neon Blue Accent */}
          <Show when={props.track.comment}>
            <div 
              class="pt-8 px-6 pb-6"
              style={{
                background: colors.elevated,
                'border-left': `4px solid ${colors.info}`,
                'border-bottom': `1px solid ${colors.border}`
              }}
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <span class="text-lg">🎸</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span 
                      class="font-semibold text-lg leading-tight"
                      style={{
                        color: colors.info,
                        ...getNeonGlow(colors.info, 'low')
                      }}
                    >
                      {props.track.addedBy}
                    </span>
                    <span class="text-sm" style={{ color: colors.muted }}>•</span>
                    <span class="text-sm leading-normal" style={{ color: colors.muted }}>{props.track.timestamp}</span>
                  </div>
                  <p 
                    class="text-base leading-relaxed"
                    style={{
                      color: colors.body
                    }}
                  >
                    {props.track.comment}
                  </p>
                </div>
              </div>
            </div>
          </Show>
          
          {/* Section 2: Reply Input - Cyan Accent (always shown when discussion is open) */}
          <div 
            class="px-6 py-5"
            style={{
              background: colors.surface,
              'border-left': `4px solid ${colors.success}`,
              'border-bottom': `1px solid ${colors.border}`
            }}
          >
            <ReplyForm
              originalTrack={{
                title: props.track.title || 'Unknown Title',
                artist: props.track.artist
              }}
              onSubmit={(data) => {
                console.log('Reply submitted:', data);
                // Handle reply submission but keep discussion open
              }}
              onCancel={() => {
                setShowDiscussion(false);
              }}
            />
          </div>
          
          {/* Section 3: Existing Replies - Green Accent */}
          <div 
            class="px-6 py-5 pb-8"
            style={{
              background: colors.panel,
              'border-left': `4px solid ${colors.warning}`
            }}
          >
            <div class="mb-5 flex items-center justify-between">
              <h4 
                class="text-xl font-bold leading-tight"
                style={{
                  color: colors.warning,
                  ...getNeonGlow(colors.warning, 'low')
                }}
              >
                💬 Replies ({mockReplies.length})
              </h4>
              <select 
                class="px-3 py-3 text-sm font-bold rounded min-h-[44px]"
                style={{
                  background: colors.elevated,
                  border: `2px solid ${colors.border}`,
                  color: colors.body
                }}
                value={replySort()}
                onChange={(e) => setReplySort(e.currentTarget.value as 'recent' | 'likes')}
              >
                <option value="recent">Recent</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
            
            <div class="space-y-4">
              <For each={sortedReplies()}>
                {(reply) => (
                  <ReplyItem 
                    reply={reply}
                    variant="compact"
                    onLike={(id) => console.log('Like reply:', id)}
                    onReply={(id) => console.log('Reply to:', id)}
                  />
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default TrackItem;