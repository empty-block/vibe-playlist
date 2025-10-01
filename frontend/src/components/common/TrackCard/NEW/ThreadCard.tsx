import { Component, Show } from 'solid-js';
// import ExpandableText from '../../../ui/ExpandableText';
import './threadCard.css';

// Temporary mock until we copy ExpandableText to frontend
const ExpandableText: any = ({ text }: { text: string }) => <div>{text}</div>;

interface ThreadCardProps {
  threadId: string;
  threadText: string;
  creatorUsername: string;
  creatorAvatar?: string;
  timestamp: string;
  replyCount: number;
  likeCount: number;
  starterTrack?: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    source: string;
  };
  onCardClick?: () => void;
  onUsernameClick?: (e: Event) => void;
  onArtistClick?: (e: Event) => void;
}

const ThreadCard: Component<ThreadCardProps> = (props) => {
  const handleCardClick = () => {
    if (props.onCardClick) {
      props.onCardClick();
    }
  };

  const handleUsernameClick = (e: Event) => {
    e.stopPropagation();
    if (props.onUsernameClick) {
      props.onUsernameClick(e);
    }
  };

  const handleArtistClick = (e: Event) => {
    e.stopPropagation();
    if (props.onArtistClick) {
      props.onArtistClick(e);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    return `${Math.floor(diffDays / 30)}m`;
  };

  return (
    <article
      class="thread-card"
      onClick={handleCardClick}
      role="article"
      aria-label={`Thread by ${props.creatorUsername}: ${props.threadText}`}
    >
      {/* Thread Text (The Question/Title) - Expandable */}
      <div class="thread-card__text">
        <ExpandableText
          text={props.threadText}
          maxLength={80}
          className="thread-card__text-content"
        />
      </div>

      {/* Starter Track (if present) */}
      <Show when={props.starterTrack}>
        {(track) => (
          <div class="thread-card__track">
            <img
              class="thread-card__album-art"
              src={track().albumArt}
              alt={`Album art for ${track().title}`}
              loading="lazy"
            />
            <div class="thread-card__track-info">
              <div class="thread-card__track-title">
                {track().title}
              </div>
              <div
                class="thread-card__track-artist"
                onClick={handleArtistClick}
              >
                {track().artist}
              </div>
            </div>
          </div>
        )}
      </Show>

      {/* Footer: Creator & Stats */}
      <div class="thread-card__footer">
        <div class="thread-card__creator">
          shared by{' '}
          <span
            class="thread-card__username"
            onClick={handleUsernameClick}
          >
            @{props.creatorUsername}
          </span>
          {' • '}
          <span class="thread-card__timestamp">
            {formatTimeAgo(props.timestamp)}
          </span>
        </div>

        <div class="thread-card__stats">
          <span class="thread-card__stat">
            <span>💬</span>
            <span>{props.replyCount} replies</span>
          </span>
          <span class="thread-card__stat">
            <span>❤️</span>
            <span>{props.likeCount} likes</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
