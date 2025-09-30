import { Component, createSignal } from 'solid-js';
import { Track } from '../../../stores/playerStore';
import { heartBeat, particleBurst, socialButtonClick } from '../../../utils/animations';

interface TrackSocialActionsProps {
  track: Track;
  onLike?: (track: Track) => void;
  onReply?: (track: Track) => void;
  compact?: boolean;
  className?: string;
}

const TrackSocialActions: Component<TrackSocialActionsProps> = (props) => {
  const [isLiked, setIsLiked] = createSignal(false);
  const [likeCount, setLikeCount] = createSignal(props.track.likes);
  const [replyCount, setReplyCount] = createSignal(props.track.replies);

  let likeButtonRef: HTMLButtonElement | undefined;
  let replyButtonRef: HTMLButtonElement | undefined;

  const handleLikeClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (likeButtonRef) {
      if (isLiked()) {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        socialButtonClick(likeButtonRef);
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        heartBeat(likeButtonRef);
        particleBurst(likeButtonRef);
      }
    }
    props.onLike?.(props.track);
  };

  const handleReplyClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (replyButtonRef) {
      socialButtonClick(replyButtonRef);
    }
    props.onReply?.(props.track);
  };

  const buttonClasses = () => {
    return props.compact
      ? 'flex items-center gap-1 text-xs font-mono px-1.5 py-1 rounded transition-colors cursor-pointer'
      : 'flex items-center gap-1 text-sm font-mono px-2 py-1 rounded transition-colors cursor-pointer';
  };

  return (
    <div class={`flex items-center gap-2 ${props.className || ''}`}>
      {/* Reply Button */}
      <button
        ref={replyButtonRef}
        onClick={handleReplyClick}
        class={`${buttonClasses()} hover:bg-blue-500/10`}
        aria-label={`${replyCount()} replies`}
      >
        <span class="text-blue-400">💬</span>
        <span class="text-blue-400">{replyCount()}</span>
      </button>

      {/* Like Button */}
      <button
        ref={likeButtonRef}
        onClick={handleLikeClick}
        class={`${buttonClasses()} hover:bg-red-500/10 ${
          isLiked() ? 'bg-red-500/20' : ''
        }`}
        aria-label={`${likeCount()} likes`}
      >
        <span class={isLiked() ? 'text-red-300' : 'text-red-400'}>
          {isLiked() ? '❤️' : '❤'}
        </span>
        <span class={isLiked() ? 'text-red-300' : 'text-red-400'}>
          {likeCount()}
        </span>
      </button>
    </div>
  );
};

export default TrackSocialActions;