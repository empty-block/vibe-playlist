import { Component } from 'solid-js';

interface SocialActionsProps {
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  onAdd?: () => void;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  variant?: 'buttons' | 'links';
  className?: string;
}

const SocialActions: Component<SocialActionsProps> = (props) => {
  const size = () => props.size || 'md';
  const layout = () => props.layout || 'horizontal';
  const variant = () => props.variant || 'buttons';
  
  const getSizeClasses = () => {
    switch (size()) {
      case 'sm': 
        return variant() === 'buttons' 
          ? 'text-xs py-1 px-2' 
          : 'text-xs';
      case 'lg': 
        return variant() === 'buttons' 
          ? 'text-base py-3 px-4' 
          : 'text-base';
      default: 
        return variant() === 'buttons' 
          ? 'text-sm py-2 px-3' 
          : 'text-sm';
    }
  };
  
  const layoutClasses = () => {
    const gap = size() === 'sm' ? 'gap-1' : size() === 'lg' ? 'gap-4' : 'gap-2';
    return layout() === 'vertical' ? `flex-col ${gap}` : `items-center ${gap}`;
  };
  
  const buttonBaseClass = () => variant() === 'buttons' 
    ? `win95-button flex items-center justify-center ${getSizeClasses()}` 
    : `hover:text-blue-500 transition-colors ${getSizeClasses()}`;
    
  const containerClass = () => variant() === 'buttons'
    ? `flex ${layoutClasses()} ${props.className || ''}`
    : `flex ${layoutClasses()} text-gray-500 ${props.className || ''}`;

  return (
    <div class={containerClass()}>
      {props.onLike && (
        <button 
          onClick={props.onLike}
          class={`${buttonBaseClass()} ${variant() === 'buttons' ? 'flex-1' : ''}`}
        >
          <i class="fas fa-heart mr-1"></i>Like
        </button>
      )}
      
      {props.onAdd && (
        <button 
          onClick={props.onAdd}
          class={`${buttonBaseClass()} ${variant() === 'buttons' ? 'flex-1' : ''}`}
        >
          <i class="fas fa-plus mr-1"></i>Add
        </button>
      )}
      
      {props.onShare && (
        <button 
          onClick={props.onShare}
          class={`${buttonBaseClass()} ${variant() === 'buttons' ? 'flex-1' : ''}`}
        >
          <i class="fas fa-share mr-1"></i>Share
        </button>
      )}
      
      {props.onReply && (
        <button 
          onClick={props.onReply}
          class={buttonBaseClass()}
        >
          <i class="fas fa-reply mr-1"></i>Reply
        </button>
      )}
    </div>
  );
};

export default SocialActions;