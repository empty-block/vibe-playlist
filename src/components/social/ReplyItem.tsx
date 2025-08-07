import { Component } from 'solid-js';
import SocialActions from './SocialActions';
import { Reply } from '../../stores/playlistStore';

interface ReplyItemProps {
  reply: Reply;
  variant?: 'default' | 'compact' | 'modal';
  onLike?: (replyId: string) => void;
  onReply?: (replyId: string) => void;
  className?: string;
}

const ReplyItem: Component<ReplyItemProps> = (props) => {
  const variant = () => props.variant || 'default';
  
  const getContainerClass = () => {
    switch (variant()) {
      case 'compact':
        return 'p-2 border-b border-gray-200 last:border-b-0';
      case 'modal':
        return 'bg-white rounded-lg p-3 border border-gray-200';
      default:
        return 'p-3 border-b border-gray-200 last:border-b-0';
    }
  };
  
  const getTextSize = () => {
    switch (variant()) {
      case 'compact':
        return { username: 'text-xs', timestamp: 'text-xs', comment: 'text-xs' };
      case 'modal':
        return { username: 'text-sm', timestamp: 'text-xs', comment: 'text-sm' };
      default:
        return { username: 'text-xs', timestamp: 'text-xs', comment: 'text-sm' };
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

  const textSizes = getTextSize();

  return (
    <div class={`${getContainerClass()} ${props.className || ''}`}>
      <div class="flex items-start gap-2">
        <span class="text-lg flex-shrink-0">{props.reply.userAvatar}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class={`font-bold ${textSizes.username} text-gray-800`}>
              {props.reply.username}
            </span>
            <span class={`${textSizes.timestamp} text-gray-500`}>
              {props.reply.timestamp}
            </span>
          </div>
          <p class={`${textSizes.comment} text-gray-700 leading-relaxed ${variant() === 'compact' ? '' : 'py-1'}`}>
            {props.reply.comment}
          </p>
          <div class="mt-2">
            <SocialActions
              onLike={handleLike}
              onReply={handleReply}
              size="sm"
              variant="links"
              className="gap-4"
            />
            <span class="text-xs text-gray-500 ml-6">
              {props.reply.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;