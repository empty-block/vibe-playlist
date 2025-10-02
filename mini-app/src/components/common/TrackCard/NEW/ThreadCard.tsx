import { Component, Show } from 'solid-js';
import ExpandableText from '../../ExpandableText';
import './threadCard.css';

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
      class="terminal-thread-card"
      onClick={handleCardClick}
      role="article"
      aria-label={`Thread by ${props.creatorUsername}: ${props.threadText}`}
    >
      {/* Top border */}
      <div class="thread-card-header">
        <span>╭─ Thread </span>
        <span class="thread-id">#{props.threadId.slice(-4)}</span>
        <span> ─────────────────────────────────────────────────────────╮</span>
      </div>

      {/* User info line with avatar */}
      <div class="thread-user-line">
        <span class="border-v">│</span>
        <Show
          when={props.creatorAvatar}
          fallback={
            <div class="thread-avatar-fallback" aria-hidden="true">
              <span>@</span>
            </div>
          }
        >
          <img
            src={props.creatorAvatar}
            class="thread-avatar"
            alt={`${props.creatorUsername}'s avatar`}
            role="img"
            loading="lazy"
          />
        </Show>
        <span
          class="thread-username"
          onClick={handleUsernameClick}
          role="button"
          tabindex="0"
        >
          @{props.creatorUsername}
        </span>
        <span class="thread-separator">·</span>
        <span class="thread-timestamp-inline">
          {formatTimeAgo(props.timestamp)}
        </span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Divider between user and track */}
      <div class="thread-card-divider">
        <span>├────────────────────────────────────────────────────────────────────────┤</span>
      </div>

      {/* Track preview if present */}
      <Show when={props.starterTrack}>
        {(track) => (
          <>
            <div class="thread-track-preview">
              <span class="border-v">│</span>
              <img
                src={track().albumArt}
                class="thread-track-thumbnail"
                alt={`Album art for ${track().title}`}
                loading="lazy"
              />
              <div class="thread-track-info">
                <div class="thread-track-title">"{track().title}"</div>
                <div
                  class="thread-track-artist"
                  onClick={handleArtistClick}
                  role="button"
                  tabindex="0"
                >
                  {track().artist}
                </div>
              </div>
              <span class="border-v">│</span>
            </div>
            <div class="thread-card-divider">
              <span>├────────────────────────────────────────────────────────────────────────┤</span>
            </div>
          </>
        )}
      </Show>

      {/* Content - thread text */}
      <div class="thread-card-content">
        <span class="border-v">│</span>
        <span class="thread-text">
          <ExpandableText
            text={props.threadText}
            maxLength={80}
            className="thread-text-content"
          />
        </span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Footer - stats only, no timestamp */}
      <div class="thread-card-divider">
        <span>├────────────────────────────────────────────────────────────────────────┤</span>
      </div>
      <div class="thread-card-footer">
        <span class="border-v">│</span>
        <span class="thread-stat">💬 {props.replyCount}</span>
        <span>•</span>
        <span class="thread-stat">❤ {props.likeCount}</span>
        <span class="border-v" style={{ 'margin-left': 'auto' }}>│</span>
      </div>

      {/* Bottom border */}
      <div class="thread-card-header">
        <span>╰─────────────────────────────────────────────────────────────────────╯</span>
      </div>
    </article>
  );
};

export default ThreadCard;
