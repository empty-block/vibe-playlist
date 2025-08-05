import { Component, createSignal } from 'solid-js';
import { Track, currentTrack } from '../stores/playlistStore';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
}

const TrackItem: Component<TrackItemProps> = (props) => {
  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const [likes, setLikes] = createSignal(props.track.likes);
  const [hasLiked, setHasLiked] = createSignal(false);
  
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
  
  return (
    <div 
      class={`win95-button p-4 cursor-pointer hover:bg-gray-200 transition-all ${
        isCurrentTrack() ? 'bg-blue-100' : ''
      }`}
      onClick={props.onPlay}
    >
      <div class="flex items-start gap-4">
        <img 
          src={props.track.thumbnail} 
          alt={props.track.title}
          class="w-20 h-20 object-cover rounded"
        />
        
        <div class="flex-1">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-bold text-black">{props.track.title}</h3>
              <p class="text-sm text-gray-600">{props.track.artist} • {props.track.duration}</p>
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