import { Component, createSignal } from 'solid-js';
import { Track, currentTrack } from '../stores/playlistStore';
import { canPlayTrack } from '../stores/authStore';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
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
  
  const handleClick = () => {
    if (isPlayable()) {
      props.onPlay();
    }
  };
  
  const sourceInfo = getSourceInfo(props.track.source);
  
  return (
    <div 
      class={`win95-button p-4 transition-all ${
        isPlayable() 
          ? 'cursor-pointer hover:bg-gray-200' 
          : 'cursor-not-allowed opacity-60'
      } ${isCurrentTrack() ? 'bg-blue-100' : ''}`}
      onClick={handleClick}
    >
      <div class="flex items-start gap-4">
        <img 
          src={props.track.thumbnail} 
          alt={props.track.title}
          class="w-20 h-20 object-cover rounded"
        />
        
        <div class="flex-1">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-black">{props.track.title}</h3>
                {!isPlayable() && (
                  <i class="fas fa-lock text-gray-400 text-sm" title="Requires authentication"></i>
                )}
              </div>
              <div class="flex items-center gap-2">
                <p class="text-sm text-gray-600">{props.track.artist} • {props.track.duration}</p>
                <span 
                  class={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white font-medium ${sourceInfo.color}`}
                  title={`Source: ${sourceInfo.label}`}
                >
                  {sourceInfo.icon} {sourceInfo.label}
                </span>
              </div>
            </div>
            {isCurrentTrack() && (
              <span class="text-blue-600 animate-pulse">
                <i class="fas fa-play-circle text-2xl"></i>
              </span>
            )}
          </div>
          
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span class="flex items-center gap-1">
              <span class="text-lg">{props.track.userAvatar}</span>
              {props.track.addedBy}
            </span>
            <span>•</span>
            <span>{props.track.timestamp}</span>
          </div>
          
          <p class="text-sm text-gray-700 mb-3">{props.track.comment}</p>
          
          <div class="flex gap-4 text-sm">
            <button 
              class={`flex items-center gap-1 hover:text-blue-600 ${hasLiked() ? 'text-red-500' : ''}`}
              onClick={handleLike}
            >
              <i class={`fas fa-heart ${hasLiked() ? 'fas' : 'far'}`}></i>
              <span>{likes()}</span>
            </button>
            <button class="flex items-center gap-1 hover:text-blue-600">
              <i class="fas fa-comment"></i>
              <span>{props.track.replies}</span>
            </button>
            <button class="flex items-center gap-1 hover:text-blue-600">
              <i class="fas fa-retweet"></i>
              <span>{props.track.recasts}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackItem;