import { Component } from 'solid-js';

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
      ? 'flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer'
      : 'flex items-center gap-1';
  };
  
  return (
    <div class={`flex ${layoutClasses()} ${getSizeClasses()} text-gray-600 ${props.className || ''}`}>
      <span 
        class={getItemClass(!!props.onLikeClick)}
        onClick={props.onLikeClick}
      >
        <i class="fas fa-heart text-red-500"></i>
        {props.likes}{showLabels() ? ' likes' : ''}
      </span>
      <span 
        class={getItemClass(!!props.onRecastClick)}
        onClick={props.onRecastClick}
      >
        <i class="fas fa-retweet"></i>
        {props.recasts}{showLabels() ? ' recasts' : ''}
      </span>
      <span 
        class={getItemClass(!!props.onRepliesClick)}
        onClick={props.onRepliesClick}
      >
        <i class="fas fa-comment"></i>
        {props.replies}{showLabels() ? ' replies' : ''}
      </span>
    </div>
  );
};

export default SocialStats;