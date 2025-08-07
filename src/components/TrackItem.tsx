import { Component, createSignal, Show, createMemo, For, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { Track, currentTrack, Reply } from '../stores/playlistStore';
import { canPlayTrack, isSpotifyAuthenticated, initiateSpotifyAuth } from '../stores/authStore';
import SocialStats from './social/SocialStats';
import ReplyItem from './social/ReplyItem';
import AnimatedButton from './AnimatedButton';
import { slideIn, staggeredFadeIn, playbackButtonHover, particleBurst, magnetic } from '../utils/animations';
import anime from 'animejs';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
}

// Using Reply interface from playlistStore now

const TrackItem: Component<TrackItemProps> = (props) => {
  let trackItemRef: HTMLDivElement;
  let playButtonRef: HTMLButtonElement;
  let thumbnailRef: HTMLImageElement;

  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isPlayable = () => {
    console.log('TrackItem Debug:', {
      title: props.track.title,
      source: props.track.source,
      sourceId: props.track.sourceId,
      videoId: props.track.videoId,
      canPlay: canPlayTrack(props.track.source)
    });
    return canPlayTrack(props.track.source);
  };
  const [likes, setLikes] = createSignal(props.track.likes);
  const [hasLiked, setHasLiked] = createSignal(false);
  const [showReplies, setShowReplies] = createSignal(false);
  const [replySort, setReplySort] = createSignal<'recent' | 'likes'>('recent');

  onMount(() => {
    // Add hover animations for playable tracks
    if (trackItemRef && isPlayable()) {
      trackItemRef.addEventListener('mouseenter', () => {
        // Subtle hover effect
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
        props.onPlay(); // Actually play the track
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
        return { icon: '▶️', label: 'YouTube', color: 'bg-red-500' };
      case 'spotify':
        return { icon: '🎵', label: 'Spotify', color: 'bg-green-500' };
      case 'soundcloud':
        return { icon: '☁️', label: 'SoundCloud', color: 'bg-orange-500' };
      default:
        return { icon: '🎵', label: source, color: 'bg-gray-500' };
    }
  };
  
  const handleLike = (e: MouseEvent) => {
    e.stopPropagation();
    if (hasLiked()) {
      setLikes(likes() - 1);
      setHasLiked(false);
    } else {
      setLikes(likes() + 1);
      setHasLiked(true);
    }
  };
  
  const handleRepliesClick = (e: MouseEvent) => {
    e.stopPropagation();
    setShowReplies(!showReplies());
  };

  // Mock replies data - in real app this would come from store/API
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
        // Sort by recent - parse timestamp
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
      class={`win95-button p-6 ${
        isPlayable() 
          ? 'cursor-pointer' 
          : 'cursor-not-allowed opacity-60'
      } ${isCurrentTrack() ? 'border-4 border-blue-400' : ''}`}
      onClick={handleClick}
      style={{
        transform: 'translateZ(0)', // Enable hardware acceleration
        transition: 'none', // Disable CSS transitions since we're using anime.js
        ...(isCurrentTrack() ? {
          'box-shadow': '0 0 25px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.1)'
        } : {})
      }}
    >
      <div class="flex gap-4 min-w-0">
        <div class="flex-1 min-w-0">
          {/* User info at top */}
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Shared by</span>
              <A 
                href={`/profile/${props.track.addedBy}`}
                class="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg px-2 py-1 -ml-2"
                onClick={(e) => e.stopPropagation()}
                title={`View ${props.track.addedBy}'s profile`}
              >
                <span class="text-xl">{props.track.userAvatar}</span>
                <span class="text-base text-black hover:text-blue-700">{props.track.addedBy}</span>
              </A>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{props.track.timestamp}</span>
              {isCurrentTrack() && (
                <span class="text-blue-600 font-bold text-xs uppercase tracking-wider animate-pulse">
                  NOW PLAYING
                </span>
              )}
            </div>
          </div>
          
          {/* Song info and thumbnail row */}
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 relative group">
              <img 
                ref={thumbnailRef!}
                src={props.track.thumbnail} 
                alt={props.track.title}
                class="w-24 h-24 object-cover rounded-lg shadow-md border-2 border-gray-300 hover:shadow-lg transition-shadow duration-200"
              />
              
              {/* Gradient Play Button Overlay */}
              {isPlayable() && (
                <button
                  ref={playButtonRef!}
                  onClick={props.onPlay}
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-300"
                  title="Play this track"
                  style={{
                    transition: 'none' // Disable CSS transitions for anime.js
                  }}
                >
                  <div class="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <i class="fas fa-play text-gray-800 ml-1 text-lg"></i>
                  </div>
                </button>
              )}
            </div>
            
            <div class="flex-1 min-w-0">
              {/* Song info */}
              <div class="mb-2">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-black leading-tight">{props.track.title}</h3>
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
            <div class="flex items-center gap-2">
              <p class="text-sm text-gray-600 font-medium">{props.track.artist} • {props.track.duration}</p>
              <span 
                class="text-lg"
                title={`Source: ${sourceInfo.label}`}
              >
                {sourceInfo.icon}
              </span>
            </div>
          </div>
          
              <p class="text-sm text-gray-700 mb-3 leading-relaxed">{props.track.comment}</p>
              
              <SocialStats
                likes={likes()}
                recasts={props.track.recasts}
                replies={props.track.replies}
                size="sm"
                showLabels={true}
                interactive={true}
                onLikeClick={handleLike}
                onRepliesClick={handleRepliesClick}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Replies Section */}
      <Show when={showReplies()}>
        <div class="mt-4 border-t border-gray-300 pt-4">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-bold text-black">Replies ({mockReplies.length})</h4>
            <select 
              class="win95-panel px-2 py-1 text-xs font-bold text-black"
              value={replySort()}
              onChange={(e) => setReplySort(e.currentTarget.value as 'recent' | 'likes')}
            >
              <option value="recent">📅 Most Recent</option>
              <option value="likes">❤️ Most Liked</option>
            </select>
          </div>
          
          <div class="space-y-3 max-h-80 overflow-y-auto">
            <For each={sortedReplies()}>
              {(reply) => (
                <div class="w-full" onClick={(e) => e.stopPropagation()}>
                  <ReplyItem
                    reply={reply}
                    variant="default"
                    onLike={(replyId) => console.log('Like reply:', replyId)}
                    onReply={(replyId) => console.log('Reply to:', replyId)}
                    className="win95-button bg-gray-50"
                  />
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default TrackItem;