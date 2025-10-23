import { Component, Show } from 'solid-js';
import ExpandableText from '../../ExpandableText';
import { currentTrack, isPlaying, setIsPlaying } from '../../../../stores/playerStore';
import '../../../../styles/terminal.css';

interface ThreadCardProps {
  threadId: string;
  threadText: string;
  creatorUsername: string;
  creatorFid?: string;
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
    url?: string;
    sourceId?: string;
  };
  onCardClick?: () => void;
  onUsernameClick?: (fid: string, username: string, e: Event) => void;
  onArtistClick?: (e: Event) => void;
  onTrackPlay?: (track: any) => void;
}

const ThreadCard: Component<ThreadCardProps> = (props) => {
  const handleCardClick = () => {
    if (props.onCardClick) {
      props.onCardClick();
    }
  };

  const handleUsernameClick = (e: Event) => {
    e.stopPropagation();
    if (props.onUsernameClick && props.creatorFid) {
      props.onUsernameClick(props.creatorFid, props.creatorUsername, e);
    }
  };

  const handleTrackClick = (e: Event) => {
    e.stopPropagation();
    if (props.starterTrack && props.onTrackPlay) {
      const isCurrentTrack = currentTrack()?.id === props.starterTrack.id;
      const isTrackPlaying = isCurrentTrack && isPlaying();

      if (isTrackPlaying) {
        setIsPlaying(false);
      } else {
        props.onTrackPlay({
          id: props.starterTrack.id,
          title: props.starterTrack.title,
          artist: props.starterTrack.artist,
          thumbnail: props.starterTrack.albumArt,
          source: props.starterTrack.source,
          url: props.starterTrack.url || '',
          sourceId: props.starterTrack.sourceId || ''
        });
      }
    }
  };

  const isCurrentTrack = () => props.starterTrack && currentTrack()?.id === props.starterTrack.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

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

  const getShortId = () => {
    return props.threadId.slice(-4).toUpperCase();
  };

  return (
    <article
      class={`terminal-track-card terminal-activity-block terminal-activity-block--thread ${isTrackPlaying() ? 'terminal-activity-block--playing' : ''}`}
      onClick={handleCardClick}
      role="article"
      aria-label={`Thread by ${props.creatorUsername}: ${props.threadText}`}
    >
      {/* Top border */}
      <div class="terminal-block-header">
        <span>╭─────────────────────────────────────────────────────────────┬──[0x{getShortId()}]─╮</span>
      </div>

      {/* Metadata line (matching Activity cards exactly) */}
      <div class="terminal-block-meta">
        <span class="border-v">│</span>
        <span class="meta-arrow">&gt;&gt;</span>
        <span
          class="meta-username"
          onClick={handleUsernameClick}
          role="button"
          tabindex="0"
          style={{ cursor: 'pointer' }}
        >
          @{props.creatorUsername}
        </span>
        <span style={{ color: 'var(--terminal-text)' }}> started a thread</span>
        <span class="info-separator"> • </span>
        <span class="info-value">{formatTimeAgo(props.timestamp)}</span>
        <span style={{ 'margin-left': 'auto' }}></span>
        <span class="border-v">│</span>
      </div>

      {/* Divider */}
      <div class="terminal-block-divider">
        <span>├─────────────────────────────────────────────────────────────┤</span>
      </div>

      {/* Content - thread text with avatar */}
      <div class="terminal-block-content">
        <span class="border-v">│</span>
        {/* Avatar in content row */}
        <Show
          when={props.creatorAvatar}
          fallback={
            <div style={{
              width: '56px',
              height: '56px',
              'border-radius': '50%',
              background: 'var(--terminal-muted)',
              color: 'var(--terminal-dim)',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '24px',
              'flex-shrink': 0,
              'margin-right': '12px'
            }}>@</div>
          }
        >
          <img
            src={props.creatorAvatar}
            style={{
              width: '56px',
              height: '56px',
              'border-radius': '50%',
              'object-fit': 'cover',
              'flex-shrink': 0,
              'margin-right': '12px'
            }}
            alt={`${props.creatorUsername}'s avatar`}
            loading="lazy"
          />
        </Show>
        <div style={{ flex: 1, 'min-width': 0 }}>
          <ExpandableText
            text={props.threadText}
            maxLength={120}
            className="comment-text"
            style={{
              'line-height': '1.6'
            }}
          />
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Track preview if present */}
      <Show when={props.starterTrack}>
        {(track) => (
          <>
            {/* Divider */}
            <div class="terminal-block-divider">
              <span>├─────────────────────────────────────────────────────────────┤</span>
            </div>

            <div class="terminal-block-content">
              <span class="border-v">│</span>
              <div class="terminal-track-row" onClick={handleTrackClick} style={{ cursor: 'pointer' }}>
                {/* Track thumbnail */}
                <div class="terminal-thumbnail">
                  <div class="thumbnail-border-top">┌─┐</div>
                  <img
                    src={track().albumArt}
                    alt=""
                    class="thumbnail-image"
                    loading="lazy"
                  />
                  <div class="thumbnail-border-bottom">└─┘</div>
                </div>

                {/* Track info */}
                <div class="terminal-track-info">
                  <div class="track-title-line">
                    <span class="track-title">"{track().title}"</span>
                    <span class="track-source">[SRC: {track().source.toUpperCase()}]</span>
                  </div>
                  <div class="track-artist-line">
                    <span class="track-label">by</span>
                    <span class="track-artist">{track().artist}</span>
                  </div>
                </div>
              </div>
              <span class="border-v">│</span>
            </div>
          </>
        )}
      </Show>

      {/* Stats actions */}
      <div class="terminal-block-actions">
        <span class="border-v">│</span>
        <div class="terminal-social-row">
          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">💬</span>
            <span class="action-count"> {props.replyCount}</span>
            <span class="action-bracket">]</span>
          </button>

          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">❤</span>
            <span class="action-count"> {props.likeCount}</span>
            <span class="action-bracket">]</span>
          </button>

          <Show when={isTrackPlaying()}>
            <button
              class="terminal-play-btn"
              onClick={handleTrackClick}
              aria-label="Pause"
            >
              <span class="action-bracket">[</span>
              <span class="play-icon">⏸</span>
              <span class="play-text">PAUSE</span>
              <span class="action-bracket">]</span>
            </button>
          </Show>
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Bottom border */}
      <div class="terminal-block-footer">
        <span>╰──────────────────────────────────────────────────────────────╯</span>
      </div>
    </article>
  );
};

export default ThreadCard;
