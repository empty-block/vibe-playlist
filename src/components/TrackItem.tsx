import { Component, createSignal, Show, createMemo, For, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { Track, currentTrack, Reply } from '../stores/playlistStore';
import { canPlayTrack, isSpotifyAuthenticated, initiateSpotifyAuth } from '../stores/authStore';
import ReplyItem from './social/ReplyItem';
import AnimatedButton from './AnimatedButton';
import ReplyForm from './ReplyForm';
import { slideIn, staggeredFadeIn, playbackButtonHover, particleBurst, magnetic } from '../utils/animations';
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
  
  const [showConversation, setShowConversation] = createSignal(false);
  const [showReplies, setShowReplies] = createSignal(false);
  const [showReplyForm, setShowReplyForm] = createSignal(false);
  const [replySort, setReplySort] = createSignal<'recent' | 'likes'>('recent');

  onMount(() => {
    // Add hover animations for playable tracks
    if (trackItemRef && isPlayable()) {
      trackItemRef.addEventListener('mouseenter', () => {
        anime({
          targets: trackItemRef,
          scale: 1.02,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          duration: 200,
          easing: 'easeOutQuad'
        });
      });

      trackItemRef.addEventListener('mouseleave', () => {
        anime({
          targets: trackItemRef,
          scale: 1,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          duration: 200,
          easing: 'easeOutQuad'
        });
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
      class={`track-item win95-button p-4 ${
        isPlayable() 
          ? 'cursor-pointer' 
          : 'cursor-not-allowed opacity-60'
      } ${isCurrentTrack() ? 'border-4' : ''}`}
      style={{
        transform: 'translateZ(0)',
        transition: 'none',
        ...(isCurrentTrack() ? {
          'border-color': '#3b00fd',
          'box-shadow': '0 0 25px rgba(59, 0, 253, 0.8), 0 0 40px rgba(59, 0, 253, 0.4), inset 0 0 15px rgba(59, 0, 253, 0.1)'
        } : {})
      }}
      onClick={handleClick}
    >
      <div class="flex gap-4 min-w-0">
        {/* Thumbnail with Overlay Number */}
        <div class="flex-shrink-0 relative group">
          <img 
            ref={thumbnailRef!}
            src={props.track.thumbnail} 
            alt={props.track.title}
            class="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover rounded-lg shadow-md border-2 border-gray-300 hover:shadow-xl transition-shadow duration-200"
          />
          
          {/* Track Number Overlay */}
          <div class="absolute top-1 left-1 bg-black/70 backdrop-blur-sm rounded-md w-8 h-8 flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-lg drop-shadow-md font-pixel">
              {props.trackNumber}
            </span>
          </div>
          
          {/* Play Button Overlay */}
          {isPlayable() && (
            <button
              ref={playButtonRef!}
              onClick={props.onPlay}
              class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-400/0 to-green-400/0 rounded-lg transition-all duration-300"
              title="Play this track"
              style={{ 
                background: 'linear-gradient(to bottom right, rgba(4, 202, 244, 0) 0%, rgba(0, 249, 42, 0) 100%)',
                transition: 'background 300ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom right, rgba(4, 202, 244, 0.8) 0%, rgba(0, 249, 42, 0.8) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom right, rgba(4, 202, 244, 0) 0%, rgba(0, 249, 42, 0) 100%)';
              }}
            >
              <div class="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 border-2 border-white/30">
                <i class="fas fa-play text-white ml-0.5 text-lg drop-shadow-lg"></i>
              </div>
            </button>
          )}
        </div>
        
        {/* Track Info */}
        <div class="flex-1 min-w-0">
          {/* Song Title and Artist */}
          <div class="mb-2">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-black text-lg leading-tight">{props.track.title}</h3>
              {sourceInfo.icon}
              <Show when={props.track.source === 'spotify' && !isSpotifyAuthenticated()}>
                <button
                  class="win95-button px-2 py-0.5 text-xs font-bold text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    initiateSpotifyAuth();
                  }}
                  title="Connect Spotify to play this track"
                >
                  🔗 Connect
                </button>
              </Show>
            </div>
            <p class="text-sm text-gray-600">
              {props.track.artist} • {props.track.duration} • 
              <span class="text-red-500"><i class="fas fa-heart"></i> {props.track.likes || 3}</span> • 
              <span class="text-blue-500"><i class="fas fa-comment"></i> {mockReplies.length}</span>
            </p>
          </div>
          
          {/* Posted by info */}
          <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span>Posted by</span>
            <A 
              href={`/profile/${props.track.addedBy}`}
              class="font-bold text-black hover:text-blue-700 transition-colors text-base px-1 py-0.5 rounded hover:bg-blue-50"
              onClick={(e) => e.stopPropagation()}
            >
              {props.track.addedBy}
            </A>
            <span>•</span>
            <span>{props.track.timestamp}</span>
            {isCurrentTrack() && (
              <span class="text-blue-600 font-bold uppercase tracking-wider animate-pulse ml-2">
                NOW PLAYING
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div class="flex gap-3">
            {/* Show conversation button - only if there's a comment */}
            <Show when={props.track.comment}>
              <AnimatedButton
                onClick={() => {
                  const newState = !showConversation();
                  setShowConversation(newState);
                  setShowReplies(newState); // Also show/hide replies with the post
                }}
                class="win95-button px-4 py-2 text-black font-bold text-sm group relative whitespace-nowrap"
                title={showConversation() ? "Hide conversation" : "Show conversation"}
                animationType="default"
              >
                <i class={`fas fa-${showConversation() ? 'eye-slash' : 'eye'} mr-1`}></i>
                <span>{showConversation() ? 'Hide' : 'Show'} Post</span>
              </AnimatedButton>
            </Show>
            
            <AnimatedButton
              onClick={() => console.log('Like track')}
              class="win95-button px-4 py-2 text-black font-bold text-sm group relative whitespace-nowrap"
              title="Like this track"
              animationType="social"
            >
              <i class="fas fa-heart mr-1"></i>
              <span>Like</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => {
                const newReplyState = !showReplyForm();
                setShowReplyForm(newReplyState);
                setShowReplies(newReplyState); // Show/hide replies along with reply form
              }}
              class="win95-button px-4 py-2 text-black font-bold text-sm group relative whitespace-nowrap"
              title="Reply to this track"
              animationType="social"
            >
              <i class="fas fa-comment mr-1"></i>
              <span>Reply</span>
            </AnimatedButton>
          </div>
        </div>
      </div>
      
      {/* User's Post - hidden by default, spans full width */}
      <Show when={showConversation() && props.track.comment}>
        <div class="mt-3 win95-panel p-4 bg-gray-50">
          <p class="text-sm text-gray-700 leading-relaxed">{props.track.comment}</p>
        </div>
      </Show>
      
      {/* Reply Form - shown above replies */}
      <Show when={showReplyForm()}>
        <ReplyForm
          originalTrack={{
            title: props.track.title,
            artist: props.track.artist
          }}
          onSubmit={(data) => {
            console.log('Reply submitted:', data);
            setShowReplyForm(false);
            setShowReplies(false);
            // Here you would handle the actual reply submission
          }}
          onCancel={() => {
            setShowReplyForm(false);
            setShowReplies(false);
          }}
        />
      </Show>
      
      {/* Replies Section */}
      <Show when={showReplies() || showConversation()}>
        <div class="mt-4 border-t border-gray-300 pt-4">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-bold text-black">Replies ({mockReplies.length})</h4>
            <select 
              class="win95-panel px-2 py-1 text-xs font-bold text-black"
              value={replySort()}
              onChange={(e) => setReplySort(e.currentTarget.value as 'recent' | 'likes')}
            >
              <option value="recent">Recent</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
          
          <div class="space-y-3">
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
      </Show>
    </div>
  );
};

export default TrackItem;