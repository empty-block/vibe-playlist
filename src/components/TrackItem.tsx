import { Component, createSignal, Show, createMemo, For } from 'solid-js';
import { A } from '@solidjs/router';
import { Track, currentTrack } from '../stores/playlistStore';
import { canPlayTrack, isSpotifyAuthenticated, initiateSpotifyAuth } from '../stores/authStore';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
}

interface Reply {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

const TrackItem: Component<TrackItemProps> = (props) => {
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
      avatar: '🎸',
      content: 'This song literally defined my teenage years! Still gives me chills every time. 🔥',
      timestamp: '5 min ago',
      likes: 12,
      isLiked: false
    },
    {
      id: '2', 
      username: 'radiohead_stan',
      avatar: '👁️',
      content: 'Agreed! This was before they went all experimental. Pure raw emotion.',
      timestamp: '8 min ago',
      likes: 8,
      isLiked: true
    },
    {
      id: '3',
      username: 'music_lover_95',
      avatar: '🌟',
      content: 'The guitar tone on this is INSANE. Kurt knew how to make a Mustang sing! 🎸✨',
      timestamp: '12 min ago',
      likes: 5,
      isLiked: false
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
      class={`win95-button p-4 transition-all duration-200 ${
        isPlayable() 
          ? 'cursor-pointer hover:bg-gray-200 hover:shadow-lg transform hover:scale-[1.01]' 
          : 'cursor-not-allowed opacity-60'
      } ${isCurrentTrack() ? 'bg-blue-100 ring-2 ring-blue-400 ring-opacity-60' : ''}`}
      onClick={handleClick}
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
                <span class="text-blue-600 animate-pulse">
                  <i class="fas fa-play-circle text-2xl drop-shadow-lg"></i>
                </span>
              )}
            </div>
          </div>
          
          {/* Song info and thumbnail row */}
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <img 
                src={props.track.thumbnail} 
                alt={props.track.title}
                class="w-24 h-24 object-cover rounded-lg shadow-md border-2 border-gray-300 hover:shadow-lg transition-shadow duration-200"
              />
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
              
              <div class="flex gap-4 text-sm">
            <button 
              class={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-gray-100 ${hasLiked() ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500'}`}
              onClick={handleLike}
            >
              <i class={`fas fa-heart ${hasLiked() ? 'fas' : 'far'}`}></i>
              <span class="font-medium">{likes()}</span>
              <span class="text-xs">likes</span>
            </button>
            <button class="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 text-gray-600 hover:text-green-600 hover:bg-green-50">
              <i class="fas fa-retweet"></i>
              <span class="font-medium">{props.track.recasts}</span>
              <span class="text-xs">recasts</span>
            </button>
            <button 
              class="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              onClick={handleRepliesClick}
            >
              <i class="fas fa-comment"></i>
              <span class="font-medium">{props.track.replies}</span>
              <span class="text-xs">replies</span>
            </button>
              </div>
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
                <div class="win95-button p-3 bg-gray-50">
                  <div class="flex items-start gap-2">
                    <span class="text-lg">{reply.avatar}</span>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <A 
                          href={`/profile/${reply.username}`}
                          class="text-sm font-bold text-black hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {reply.username}
                        </A>
                        <span class="text-xs text-gray-500">• {reply.timestamp}</span>
                      </div>
                      <p class="text-sm text-gray-700">{reply.content}</p>
                      <div class="flex gap-3 mt-2 text-xs">
                        <button 
                          class={`flex items-center gap-1 ${
                            reply.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i class={reply.isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                          <span>{reply.likes}</span>
                        </button>
                        <button 
                          class="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i class="fas fa-reply"></i>
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
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