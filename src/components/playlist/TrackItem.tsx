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
        
        // Add enhanced neon border glow on hover for unified design
        if (!isCurrentTrack()) {
          trackItemRef.style.borderColor = 'rgba(4, 202, 244, 0.6)';
          trackItemRef.style.boxShadow = '0 8px 30px rgba(4, 202, 244, 0.3), 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(4, 202, 244, 0.2)';
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
          trackItemRef.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(4, 202, 244, 0.1)';
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
        padding: '20px',
        margin: '16px 0',
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        border: isCurrentTrack() 
          ? '3px solid transparent' 
          : '2px solid rgba(4, 202, 244, 0.3)',
        'background-image': isCurrentTrack() 
          ? 'linear-gradient(45deg, #3b00fd, #04caf4, #00f92a, #f906d6), linear-gradient(145deg, #1a1a1a, #2a2a2a)'
          : 'none',
        'background-origin': 'border-box',
        'background-clip': isCurrentTrack() ? 'padding-box, border-box' : 'padding-box',
        'border-radius': '16px',
        'box-shadow': isCurrentTrack() 
          ? '0 0 20px rgba(59, 0, 253, 0.4), 0 0 40px rgba(4, 202, 244, 0.3), inset 0 0 15px rgba(0, 249, 42, 0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(4, 202, 244, 0.1)',
        transform: 'translateZ(0)',
        transition: 'none'
      }}
      onClick={handleClick}
    >
      {/* UNIFIED RETRO BOOMBOX CONTAINER */}
      <div 
        class="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #000000, #1a1a1a)',
          border: '3px solid rgba(4, 202, 244, 0.4)',
          'box-shadow': `
            0 0 30px rgba(4, 202, 244, 0.2),
            inset 0 0 50px rgba(0, 0, 0, 0.9),
            inset 0 4px 0 rgba(255, 255, 255, 0.05),
            inset 0 -4px 0 rgba(0, 0, 0, 0.8)
          `
        }}
      >
        {/* SECTION 1: RETRO DIGITAL RADIO DISPLAY - Main Track Info */}
        <div class="w-full">
          {/* Main Display Panel */}
          <div 
            class="relative p-6 border-b-2"
            style={{
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              'border-bottom-color': 'rgba(4, 202, 244, 0.3)',
              'box-shadow': `
                inset 0 0 25px rgba(0, 0, 0, 0.8),
                0 2px 0 rgba(4, 202, 244, 0.1)
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
            <div class="flex gap-6">
              {/* Album Art with Retro Frame */}
              <div class="relative group flex-shrink-0 w-48">
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
                class="flex-1 p-4 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(4, 202, 244, 0.3)',
                  'box-shadow': 'inset 0 0 10px rgba(0, 0, 0, 0.8)'
                }}
              >
                {/* Track Title - LCD Style */}
                <div class="mb-3">
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
                    class="font-mono font-bold text-xl lg:text-2xl leading-tight break-words"
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
                <div class="mb-3">
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
                    class="font-mono font-semibold text-lg lg:text-xl break-words"
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
                <div class="flex justify-between items-end">
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
                      class="font-mono font-bold text-base lg:text-lg"
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
                      class="font-mono font-bold text-sm px-3 py-2 rounded"
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

        {/* CONSOLIDATED SECTION: USER INFO + SOCIAL STATS + ACTIONS - Single Row Layout */}
        <div 
          class="p-5"
          style={{
            background: 'linear-gradient(145deg, #0d0d0d, #1d1d1d)',
            'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Single Row Layout: Action Buttons + User Info + Social Stats */}
          <div class="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left: Action Buttons */}
            <div class="flex flex-wrap items-center gap-3">
              
              {/* JOIN DISCUSSION Button - PROMINENT POSITION for social discovery */}
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDiscussion(!showDiscussion());
                  }}
                  class="relative overflow-hidden font-bold transition-all duration-300 font-mono uppercase tracking-wide text-xs"
                  style={{
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: showDiscussion() 
                      ? '2px solid #04caf4' 
                      : '2px solid rgba(4, 202, 244, 0.4)',
                    background: showDiscussion() 
                      ? 'linear-gradient(145deg, rgba(4, 202, 244, 0.2), rgba(0, 0, 0, 0.9))' 
                      : 'linear-gradient(145deg, #2a2a2a, #0a0a0a)',
                    color: showDiscussion() ? '#04caf4' : colors.body,
                    minHeight: '40px',
                    minWidth: '130px',
                    'box-shadow': showDiscussion() 
                      ? '0 0 15px rgba(4, 202, 244, 0.4), inset 0 0 10px rgba(4, 202, 244, 0.1)'
                      : '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    'text-shadow': showDiscussion() 
                      ? '0 0 5px rgba(4, 202, 244, 0.8)'
                      : 'none',
                    'white-space': 'nowrap'
                  }}
                  title={showDiscussion() ? "Hide discussion" : "Join discussion"}
                  onMouseEnter={(e) => {
                    if (!showDiscussion()) {
                      e.currentTarget.style.borderColor = '#04caf4';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 202, 244, 0.4), inset 0 0 10px rgba(4, 202, 244, 0.1)';
                      e.currentTarget.style.color = '#04caf4';
                      e.currentTarget.style.textShadow = '0 0 5px rgba(4, 202, 244, 0.8)';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showDiscussion()) {
                      e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = colors.body;
                      e.currentTarget.style.textShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                >
                  <i class="fas fa-comments mr-2"></i>
                  <span>{showDiscussion() ? 'Hide' : 'Join'}</span>
                </button>

                {/* Like Track Button - Next to JOIN button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Like track');
                  }}
                  class="relative overflow-hidden font-bold transition-all duration-300 font-mono uppercase tracking-wide text-xs"
                  style={{
                    padding: '10px 18px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    border: '2px solid rgba(249, 6, 214, 0.4)',
                    background: 'linear-gradient(145deg, #2a2a2a, #0a0a0a)',
                    color: colors.body,
                    minHeight: '40px',
                    minWidth: '110px',
                    'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    'white-space': 'nowrap'
                  }}
                  title="Like this track"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f906d6';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(249, 6, 214, 0.4), inset 0 0 10px rgba(249, 6, 214, 0.1)';
                    e.currentTarget.style.color = '#f906d6';
                    e.currentTarget.style.textShadow = '0 0 5px rgba(249, 6, 214, 0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(249, 6, 214, 0.4)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = colors.body;
                    e.currentTarget.style.textShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <i class="fas fa-heart mr-2"></i>
                  <span>Like</span>
                </button>

            </div>
            
            {/* Center: User Info */}
            <div class="flex flex-wrap items-center gap-3">
              <div 
                class="px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(4, 202, 244, 0.4)',
                  color: 'rgba(4, 202, 244, 0.8)'
                }}
              >
                Added By
              </div>
              <A 
                href={`/profile/${props.track.addedBy}`}
                class="font-bold transition-all duration-300 px-3 py-2 rounded-lg cursor-pointer text-sm"
                style={{
                  color: '#04caf4',
                  'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)',
                  background: 'rgba(4, 202, 244, 0.1)',
                  border: '1px solid rgba(4, 202, 244, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#00f92a';
                  e.currentTarget.style.textShadow = '0 0 8px rgba(0, 249, 42, 0.8)';
                  e.currentTarget.style.background = 'rgba(0, 249, 42, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#04caf4';
                  e.currentTarget.style.textShadow = '0 0 5px rgba(4, 202, 244, 0.6)';
                  e.currentTarget.style.background = 'rgba(4, 202, 244, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {props.track.addedBy}
              </A>
              <span class="text-base" style={{ color: colors.muted }}>•</span>
              <span class="text-sm" style={{ color: colors.muted }}>{props.track.timestamp}</span>
            </div>

            {/* Right: Social Stats */}
            <div class="flex flex-wrap items-center gap-3">
              {/* Compact Likes Pill */}
              <div 
                class="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wide"
                style={{
                  background: 'rgba(249, 6, 214, 0.15)',
                  border: '1px solid rgba(249, 6, 214, 0.4)',
                  color: '#f906d6',
                  'text-shadow': '0 0 3px rgba(249, 6, 214, 0.6)',
                  'min-height': '32px'
                }}
              >
                <i class="fas fa-heart text-xs" style={{ color: '#f906d6' }}></i>
                <span>{props.track.likes || 25}</span>
              </div>
              
              {/* Compact Replies Pill */}
              <div 
                class="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wide"
                style={{
                  background: 'rgba(4, 202, 244, 0.15)',
                  border: '1px solid rgba(4, 202, 244, 0.4)',
                  color: '#04caf4',
                  'text-shadow': '0 0 3px rgba(4, 202, 244, 0.6)',
                  'min-height': '32px'
                }}
              >
                <i class="fas fa-comment text-xs" style={{ color: '#04caf4' }}></i>
                <span>{mockReplies.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* INTEGRATED DISCUSSION PANEL - Extension of the Retro Radio Unit */}
      <Show when={showDiscussion()}>
        <div 
          class="mt-4 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #000000, #1a1a1a)',
            border: '3px solid rgba(0, 249, 42, 0.4)',
            'box-shadow': `
              0 0 25px rgba(0, 249, 42, 0.2),
              inset 0 0 50px rgba(0, 0, 0, 0.9),
              inset 0 4px 0 rgba(0, 249, 42, 0.1),
              inset 0 -4px 0 rgba(0, 0, 0, 0.8)
            `
          }}
        >
          {/* DISCUSSION SECTION 1: Original Post Display */}
          <Show when={props.track.comment}>
            <div 
              class="p-6 border-b-2"
              style={{
                background: 'linear-gradient(145deg, #0d0d0d, #1d1d1d)',
                'border-bottom-color': 'rgba(4, 202, 244, 0.3)',
                'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
              }}
            >
              <div 
                class="flex items-start gap-4 p-4 rounded-lg"
                style={{
                  background: 'rgba(4, 202, 244, 0.05)',
                  border: '1px solid rgba(4, 202, 244, 0.2)'
                }}
              >
                <div class="flex-shrink-0">
                  <span class="text-xl">🎸</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <span 
                      class="font-bold text-lg font-mono"
                      style={{
                        color: '#04caf4',
                        'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)'
                      }}
                    >
                      {props.track.addedBy}
                    </span>
                    <span class="text-sm font-mono" style={{ color: colors.muted }}>•</span>
                    <span class="text-sm font-mono" style={{ color: colors.muted }}>{props.track.timestamp}</span>
                  </div>
                  <p 
                    class="text-base leading-relaxed"
                    style={{ color: colors.body }}
                  >
                    {props.track.comment}
                  </p>
                </div>
              </div>
            </div>
          </Show>
          
          {/* DISCUSSION SECTION 2: Reply Input Panel */}
          <div 
            class="p-6 border-b-2"
            style={{
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              'border-bottom-color': 'rgba(0, 249, 42, 0.3)',
              'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
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
          
          {/* DISCUSSION SECTION 3: Existing Replies Display */}
          <div 
            class="p-6"
            style={{
              background: 'linear-gradient(145deg, #0d0d0d, #1d1d1d)',
              'box-shadow': 'inset 0 0 25px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div class="mb-6 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div 
                  class="px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(0, 249, 42, 0.4)',
                    color: 'rgba(0, 249, 42, 0.8)'
                  }}
                >
                  Discussion
                </div>
                <h4 
                  class="text-xl font-bold font-mono leading-tight"
                  style={{
                    color: '#00f92a',
                    'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)'
                  }}
                >
                  💬 {mockReplies.length} Replies
                </h4>
              </div>
              <select 
                class="px-4 py-3 text-sm font-bold font-mono rounded-lg min-h-[44px]"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #0a0a0a)',
                  border: '2px solid rgba(0, 249, 42, 0.4)',
                  color: colors.body,
                  'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
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