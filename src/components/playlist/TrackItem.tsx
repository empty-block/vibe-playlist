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
          trackItemRef.style.borderColor = 'rgba(4, 202, 244, 0.6)';
          trackItemRef.style.boxShadow = '0 8px 30px rgba(4, 202, 244, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3)';
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
          trackItemRef.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
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
          ? '0 0 30px rgba(59, 0, 253, 0.6), 0 0 60px rgba(4, 202, 244, 0.4), inset 0 0 20px rgba(0, 249, 42, 0.1)'
          : '0 4px 15px rgba(0, 0, 0, 0.3)',
        transform: 'translateZ(0)',
        transition: 'none'
      }}
      onClick={handleClick}
    >
      <div class="flex flex-col min-[400px]:flex-row gap-3 sm:gap-4 min-w-0 min-[400px]:items-center">
        {/* Thumbnail - Stacks on very small screens */}
        <div class="flex-shrink-0 relative group mx-auto min-[400px]:mx-0">
          <img 
            ref={thumbnailRef!}
            src={props.track.thumbnail} 
            alt={props.track.title}
            class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg"
          />
          
          {/* Track Number - Properly overlaid on image */}
          <div 
            class="absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              'border-radius': '50%',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              'backdrop-filter': 'blur(4px)'
            }}
          >
            <span 
              class="text-white font-bold text-xs sm:text-sm md:text-base"
              style={{'text-shadow': '0 0 4px rgba(0, 0, 0, 0.8)'}}
            >
              {props.trackNumber}
            </span>
          </div>
          
          {/* Play Button Overlay */}
          {isPlayable() && (
            <button
              ref={playButtonRef!}
              onClick={props.onPlay}
              class="absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300"
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
              <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 border-2 border-white/30">
                <i class="fas fa-play text-white ml-0.5 text-sm sm:text-base md:text-lg drop-shadow-lg"></i>
              </div>
            </button>
          )}
        </div>
        
        {/* Track Info - Consolidated layout for space efficiency */}
        <div class="flex-1 min-w-0 text-center min-[400px]:text-left">
          {/* Consolidated Track Info - Single Line Format */}
          <div class="mb-2">
            {/* Track Name - Artist Name • Duration - All on one line */}
            <div class="flex items-center justify-center min-[400px]:justify-start gap-2 mb-1">
              <div class="flex-1 min-w-0">
                <h3 
                  class="font-bold text-lg leading-tight truncate"
                  style={{
                    color: isCurrentTrack() ? colors.info : colors.heading,
                    'text-shadow': isCurrentTrack() 
                      ? '0 0 12px rgba(102, 179, 255, 0.8), 0 0 20px rgba(102, 179, 255, 0.4)' 
                      : '0 0 8px rgba(102, 179, 255, 0.6)',
                    transition: 'all 0.3s ease',
                    'font-weight': '700'
                  }}
                >
                  <span class="inline">
                    {props.track.title || 'Unknown Title'}
                  </span>
                  <span class="mx-2 font-normal text-base" style={{ color: colors.muted }}>
                    -
                  </span>
                  <span 
                    class="font-medium text-base"
                    style={{
                      color: colors.success,
                      'text-shadow': '0 0 10px rgba(76, 175, 80, 0.6)',
                      'font-weight': '500'
                    }}
                  >
                    {props.track.artist}
                  </span>
                  <span class="mx-2 font-normal text-sm" style={{ color: colors.muted }}>
                    •
                  </span>
                  <span class="font-normal text-sm" style={{ color: colors.muted }}>
                    {props.track.duration}
                  </span>
                </h3>
              </div>
              <span class="text-lg flex-shrink-0">{sourceInfo.icon}</span>
            </div>

            {/* Spotify Connect Button - If needed */}
            <Show when={props.track.source === 'spotify' && !isSpotifyAuthenticated()}>
              <button
                class="px-4 py-2 text-sm font-bold mb-2 border-2 transition-all duration-200"
                style={{
                  background: 'linear-gradient(145deg, #dfdfdf, #c0c0c0)',
                  'border-color': colors.success,
                  color: 'black',
                  'box-shadow': `inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, 0 0 15px ${colors.success}60`,
                  'min-height': '36px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  initiateSpotifyAuth();
                }}
                title="Connect Spotify to play this track"
              >
                🔗 Connect Spotify
              </button>
            </Show>
          </div>

          {/* Consolidated User Attribution & Social Stats Row */}
          <div class="flex flex-wrap items-center justify-center min-[400px]:justify-between gap-2 mb-2 py-2 px-3 rounded-lg" style={{
            background: 'rgba(102, 179, 255, 0.05)',
            border: `1px solid ${colors.border}`
          }}>
            {/* Left side: User attribution with timestamp */}
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span style={{ color: colors.muted, 'font-weight': '400' }}>added by</span>
              <A 
                href={`/profile/${props.track.addedBy}`}
                class="font-bold transition-all duration-300 px-2 py-1 rounded-md cursor-pointer"
                style={{
                  color: colors.info,
                  'text-shadow': `0 0 8px ${colors.info}60`,
                  'font-size': '14px',
                  'min-height': '32px',
                  display: 'inline-flex',
                  'align-items': 'center',
                  background: 'rgba(102, 179, 255, 0.1)',
                  border: `1px solid ${colors.info}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.success;
                  e.currentTarget.style.textShadow = `0 0 12px ${colors.success}80`;
                  e.currentTarget.style.background = 'rgba(76, 175, 80, 0.15)';
                  e.currentTarget.style.borderColor = `${colors.success}60`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.info;
                  e.currentTarget.style.textShadow = `0 0 8px ${colors.info}60`;
                  e.currentTarget.style.background = 'rgba(102, 179, 255, 0.1)';
                  e.currentTarget.style.borderColor = `${colors.info}40`;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {props.track.addedBy}
              </A>
              <span style={{ color: colors.muted }}>•</span>
              <span class="whitespace-nowrap text-sm" style={{ color: colors.muted }}>{props.track.timestamp}</span>
              {isCurrentTrack() && (
                <span 
                  class="font-bold uppercase tracking-wider text-xs px-2 py-1 rounded-md ml-1"
                  style={{
                    color: colors.success,
                    background: 'rgba(76, 175, 80, 0.15)',
                    border: `1px solid ${colors.success}50`,
                    'text-shadow': `0 0 10px ${colors.success}80`,
                    animation: 'neon-pulse 2s ease-in-out infinite'
                  }}
                >
                  NOW PLAYING
                </span>
              )}
            </div>

            {/* Right side: Social stats (likes and replies counts) */}
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 text-sm" style={{ color: colors.info }}>
                <i class="fas fa-heart"></i>
                <span class="font-semibold">{props.track.likes || 3}</span>
              </div>
              <div class="flex items-center gap-1 text-sm" style={{ color: colors.success }}>
                <i class="fas fa-comment"></i>
                <span class="font-semibold">{mockReplies.length}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Compact spacing */}
          <div class="flex flex-wrap gap-2 justify-center min-[400px]:justify-start">
            {/* Discussion button - shows if there's a comment OR to encourage replies */}
            <button
              onClick={() => setShowDiscussion(!showDiscussion())}
              class="relative overflow-hidden font-bold transition-all duration-300"
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: `2px solid ${colors.info}40`,
                background: showDiscussion() 
                  ? `linear-gradient(145deg, rgba(102, 179, 255, 0.2), rgba(42, 42, 42, 0.8))` 
                  : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                color: showDiscussion() ? colors.info : colors.body,
                minWidth: '130px',
                minHeight: '36px',
                'box-shadow': showDiscussion() 
                  ? `0 0 20px ${colors.info}60, 0 0 40px ${colors.info}30`
                  : '0 2px 8px rgba(0, 0, 0, 0.3)',
                'text-shadow': showDiscussion() 
                  ? `0 0 8px ${colors.info}80`
                  : 'none'
              }}
              title={showDiscussion() ? "Hide discussion" : "Join discussion"}
              onMouseEnter={(e) => {
                if (!showDiscussion()) {
                  e.currentTarget.style.borderColor = `${colors.info}80`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${colors.info}60, 0 0 40px ${colors.info}30`;
                  e.currentTarget.style.color = colors.info;
                  e.currentTarget.style.textShadow = `0 0 8px ${colors.info}80`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showDiscussion()) {
                  e.currentTarget.style.borderColor = `${colors.info}40`;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.color = colors.body;
                  e.currentTarget.style.textShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <i class="fas fa-comments mr-1"></i>
              <span class="hidden sm:inline">{showDiscussion() ? 'Hide' : 'Discussion'}</span>
              <span class="sm:hidden">💬</span>
            </button>
            
            <button
              onClick={() => console.log('Like track')}
              class="relative overflow-hidden font-bold transition-all duration-300"
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: `2px solid ${colors.error}40`,
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                color: colors.body,
                minWidth: '110px',
                minHeight: '36px',
                'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
              title="Like this track"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${colors.error}80`;
                e.currentTarget.style.boxShadow = `0 0 20px ${colors.error}60, 0 0 40px ${colors.error}30`;
                e.currentTarget.style.color = colors.error;
                e.currentTarget.style.textShadow = `0 0 8px ${colors.error}80`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${colors.error}40`;
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.color = colors.body;
                e.currentTarget.style.textShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i class="fas fa-heart mr-1"></i>
              <span>Like</span>
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