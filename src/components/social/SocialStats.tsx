import { Component, onMount } from 'solid-js';
import { heartBeat, socialButtonClick } from '../../utils/animations';

interface SocialStatsProps {
  likes: number;
  replies: number;
  recasts: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  onLikeClick?: () => void;
  onRecastClick?: () => void;
  onRepliesClick?: () => void;
  interactive?: boolean;
}

const SocialStats: Component<SocialStatsProps> = (props) => {
  let likeButtonRef: HTMLSpanElement;
  let recastButtonRef: HTMLSpanElement;
  let repliesButtonRef: HTMLSpanElement;

  const size = () => props.size || 'md';
  const showLabels = () => props.showLabels ?? true;
  const layout = () => props.layout || 'horizontal';
  const interactive = () => props.interactive ?? false;
  
  const getSizeClasses = () => {
    switch (size()) {
      case 'sm': return 'text-xs gap-2';
      case 'lg': return 'text-base gap-4';
      default: return 'text-sm gap-3';
    }
  };
  
  const layoutClasses = () => layout() === 'vertical' ? 'flex-col' : 'items-center';
  
  const getItemClass = (hasClick: boolean) => {
    return interactive() && hasClick 
      ? 'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer'
      : 'flex items-center gap-1';
  };

  const handleLikeClick = () => {
    if (likeButtonRef && props.onLikeClick) {
      heartBeat(likeButtonRef);
      props.onLikeClick();
    }
  };

  const handleRecastClick = () => {
    if (recastButtonRef && props.onRecastClick) {
      socialButtonClick(recastButtonRef);
      props.onRecastClick();
    }
  };

  const handleRepliesClick = () => {
    if (repliesButtonRef && props.onRepliesClick) {
      socialButtonClick(repliesButtonRef);
      props.onRepliesClick();
    }
  };
  
  return (
    <div class={`flex ${layoutClasses()} ${getSizeClasses()} text-gray-600 ${props.className || ''}`}>
      <span 
        ref={likeButtonRef!}
        class={getItemClass(!!props.onLikeClick)}
        onClick={handleLikeClick}
        style={{ transform: 'translateZ(0)' }} // Enable hardware acceleration
      >
        <i class="fas fa-heart text-red-500"></i>
        {props.likes}{showLabels() ? ' likes' : ''}
      </span>
      <span 
        ref={recastButtonRef!}
        class={getItemClass(!!props.onRecastClick)}
        onClick={handleRecastClick}
        style={{ transform: 'translateZ(0)' }}
      >
        <i class="fas fa-retweet"></i>
        {props.recasts}{showLabels() ? ' recasts' : ''}
      </span>
      <span 
        ref={repliesButtonRef!}
        class={getItemClass(!!props.onRepliesClick)}
        onClick={handleRepliesClick}
        style={{ transform: 'translateZ(0)' }}
      >
        <i class="fas fa-comment"></i>
        {props.replies}{showLabels() ? ' replies' : ''}
      </span>
    </div>
  );
};

export default SocialStats;