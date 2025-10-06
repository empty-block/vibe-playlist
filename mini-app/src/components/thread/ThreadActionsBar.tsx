// /mini-app/src/components/thread/ThreadActionsBar.tsx
import { Component, createSignal } from 'solid-js';
import './threadActionsBar.css';

interface ThreadActionsBarProps {
  threadId: string;
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  onAddReply: () => void;
}

const ThreadActionsBar: Component<ThreadActionsBarProps> = (props) => {
  const [isLiking, setIsLiking] = createSignal(false);

  const handleLike = async () => {
    if (isLiking()) return;

    setIsLiking(true);
    try {
      await props.onLike();
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      class="thread-actions-bar"
      role="toolbar"
      aria-label="Thread actions"
    >
      <div class="thread-actions-buttons">
        {/* Like Button */}
        <button
          class="action-button-like"
          classList={{ liked: props.isLiked }}
          onClick={handleLike}
          disabled={isLiking()}
          aria-label={props.isLiked ? 'Unlike thread' : 'Like thread'}
          aria-pressed={props.isLiked}
        >
          <span class="action-bracket">[</span>
          <span class="action-icon">{props.isLiked ? '✓' : '❤'}</span>
          <span class="action-text">
            {props.isLiked ? 'LIKED' : 'LIKE_THREAD'}
          </span>
          <span class="action-bracket">]</span>
        </button>

        {/* Add Reply Button */}
        <button
          class="action-button-reply"
          onClick={props.onAddReply}
          aria-label="Add reply to thread"
        >
          <span class="action-bracket">[</span>
          <span class="action-icon">+</span>
          <span class="action-text">ADD_REPLY</span>
          <span class="action-bracket">]</span>
        </button>
      </div>

      {/* Screen reader status announcements */}
      <div class="sr-only" role="status" aria-live="polite">
        {props.isLiked ? 'Thread liked' : ''}
      </div>
    </div>
  );
};

export default ThreadActionsBar;
