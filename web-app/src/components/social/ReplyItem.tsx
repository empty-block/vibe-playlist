import { Component } from 'solid-js';
import { Reply } from '../../stores/playerStore';
import { getThemeColors, contrastColors } from '../../utils/contrastColors';

interface ReplyItemProps {
  reply: Reply;
  variant?: 'default' | 'compact' | 'modal';
  onLike?: (replyId: string) => void;
  onReply?: (replyId: string) => void;
  onUserClick?: (username: string) => void;
  className?: string;
}

const ReplyItem: Component<ReplyItemProps> = (props) => {
  const variant = () => props.variant || 'default';
  const colors = getThemeColors();
  
  const getContainerStyle = () => {
    const baseStyle = {
      background: colors.elevated,
      borderLeft: `3px solid ${contrastColors.neon.cyan}`,
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    };
    
    switch (variant()) {
      case 'compact':
        return { 
          ...baseStyle, 
          padding: '1rem',
          marginBottom: '0.75rem'
        };
      case 'modal':
        return { 
          ...baseStyle, 
          padding: '1.25rem',
          border: `1px solid ${colors.border}`,
          marginBottom: '1rem'
        };
      default:
        return { 
          ...baseStyle, 
          padding: '1.25rem',
          marginBottom: '1.25rem'
        };
    }
  };
  
  const getTypography = () => {
    switch (variant()) {
      case 'compact':
        return { 
          username: 'text-base font-bold', 
          timestamp: 'text-sm', 
          comment: 'text-sm leading-relaxed' 
        };
      case 'modal':
        return { 
          username: 'text-lg font-bold', 
          timestamp: 'text-sm', 
          comment: 'text-base leading-relaxed' 
        };
      default:
        return { 
          username: 'text-lg font-bold', 
          timestamp: 'text-sm', 
          comment: 'text-base leading-relaxed' 
        };
    }
  };

  const handleLike = () => {
    if (props.onLike) {
      props.onLike(props.reply.id);
    }
  };

  const handleReply = () => {
    if (props.onReply) {
      props.onReply(props.reply.id);
    }
  };

  const handleUserClick = () => {
    if (props.onUserClick) {
      props.onUserClick(props.reply.username);
    }
  };

  const typography = getTypography();

  const createNeonButton = (
    icon: string, 
    text: string, 
    onClick: () => void, 
    accentColor: string
  ) => (
    <button 
      onClick={onClick}
      class="flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 font-medium min-h-[44px] min-w-[44px]"
      style={{
        background: `linear-gradient(135deg, ${colors.elevated} 0%, ${colors.panel} 100%)`,
        border: `1px solid ${accentColor}`,
        color: accentColor,
        'box-shadow': `0 0 10px ${accentColor}20`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${colors.panel} 0%, ${colors.elevated} 100%)`;
        e.currentTarget.style.boxShadow = `0 0 20px ${accentColor}40`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${colors.elevated} 0%, ${colors.panel} 100%)`;
        e.currentTarget.style.boxShadow = `0 0 10px ${accentColor}20`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <i class={`${icon} text-sm`}></i>
      <span class="text-sm">{text}</span>
    </button>
  );

  return (
    <div 
      class={`${props.className || ''} group cursor-pointer`}
      style={getContainerStyle()}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.panel;
        e.currentTarget.style.borderLeftColor = contrastColors.neon.green;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.elevated;
        e.currentTarget.style.borderLeftColor = contrastColors.neon.cyan;
      }}
    >
      <div class="flex items-start gap-4">
        {/* Avatar */}
        <span class="text-2xl flex-shrink-0 mt-1">{props.reply.userAvatar}</span>
        
        <div class="flex-1 min-w-0">
          {/* User info header */}
          <div class="flex items-center gap-3 mb-3">
            <button
              onClick={handleUserClick}
              class={`${typography.username} hover:underline transition-colors duration-200`}
              style={{ 
                color: contrastColors.neon.cyan,
                textShadow: `0 0 8px ${contrastColors.neon.cyan}40`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = contrastColors.neon.green;
                e.currentTarget.style.textShadow = `0 0 12px ${contrastColors.neon.green}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = contrastColors.neon.cyan;
                e.currentTarget.style.textShadow = `0 0 8px ${contrastColors.neon.cyan}40`;
              }}
              title={`View ${props.reply.username}'s profile`}
            >
              {props.reply.username}
            </button>
            <span class="text-lg font-bold" style={{ color: contrastColors.neon.cyan }}>
              •
            </span>
            <span 
              class={`${typography.timestamp}`}
              style={{ color: colors.muted }}
            >
              {props.reply.timestamp}
            </span>
          </div>
          
          {/* Comment text */}
          <p 
            class={`${typography.comment} mb-4`}
            style={{ 
              color: colors.body,
              lineHeight: '1.6'
            }}
          >
            {props.reply.comment}
          </p>
          
          {/* Action buttons */}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              {props.onLike && createNeonButton(
                'fas fa-heart', 
                'Like', 
                handleLike, 
                contrastColors.neon.pink
              )}
              {props.onReply && createNeonButton(
                'fas fa-reply', 
                'Reply', 
                handleReply, 
                contrastColors.neon.cyan
              )}
            </div>
            
            {/* Like count */}
            <div class="flex items-center gap-2">
              <span 
                class="text-sm font-medium"
                style={{ color: colors.muted }}
              >
                {props.reply.likes}
              </span>
              <i 
                class="fas fa-heart text-sm"
                style={{ color: contrastColors.neon.pink }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;