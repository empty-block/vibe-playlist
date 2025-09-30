import { Component } from 'solid-js';
import { getThemeColors } from '../../utils/contrastColors';

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
  const colors = getThemeColors();
  
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
  
  const getButtonStyle = (isHover = false) => variant() === 'buttons' 
    ? {
        background: colors.elevated,
        border: `1px solid ${colors.border}`,
        color: colors.body,
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }
    : {
        color: isHover ? colors.linkHover : colors.link,
        cursor: 'pointer',
        transition: 'color 0.2s ease'
      };
    
  const containerStyle = () => ({
    display: 'flex',
    alignItems: layout() === 'vertical' ? 'flex-start' : 'center',
    flexDirection: layout() === 'vertical' ? 'column' : 'row',
    gap: size() === 'sm' ? '0.25rem' : size() === 'lg' ? '1rem' : '0.5rem'
  });

  const createButton = (icon: string, text: string, onClick: () => void) => (
    <button 
      onClick={onClick}
      class={`flex items-center justify-center ${getSizeClasses()}`}
      style={getButtonStyle()}
      onMouseEnter={(e) => {
        if (variant() === 'buttons') {
          e.currentTarget.style.borderColor = colors.borderHover;
          e.currentTarget.style.color = colors.linkHover;
        } else {
          e.currentTarget.style.color = colors.linkHover;
        }
      }}
      onMouseLeave={(e) => {
        if (variant() === 'buttons') {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.color = colors.body;
        } else {
          e.currentTarget.style.color = colors.link;
        }
      }}
    >
      <i class={`${icon} mr-1`}></i>{text}
    </button>
  );

  return (
    <div 
      class={props.className || ''}
      style={containerStyle()}
    >
      {props.onLike && createButton('fas fa-heart', 'Like', props.onLike)}
      {props.onAdd && createButton('fas fa-plus', 'Add', props.onAdd)}
      {props.onShare && createButton('fas fa-share', 'Share', props.onShare)}
      {props.onReply && createButton('fas fa-reply', 'Reply', props.onReply)}
    </div>
  );
};

export default SocialActions;