import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying } from '../../../../stores/playerStore';
import '../../../../styles/terminal.css';

interface HeroTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onLike: (track: Track) => void;
  onReply: (track: Track) => void;
  showSocialContext?: boolean;
  showComment?: boolean;
  className?: string;
}

const HeroTrackCard: Component<HeroTrackCardProps> = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [imageError, setImageError] = createSignal(false);

  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  const handlePlayClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onPlay(props.track);
  };

  const handleLikeClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onLike(props.track);
  };

  const handleReplyClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onReply(props.track);
  };

  const getShortId = () => {
    return props.track.id.slice(-4).toUpperCase();
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return '';
    if (timestamp.includes('ago') || timestamp === 'now') {
      return timestamp
        .replace(' hours ago', 'h')
        .replace(' hour ago', 'h')
        .replace(' days ago', 'd')
        .replace(' day ago', 'd')
        .replace(' weeks ago', 'w')
        .replace(' week ago', 'w')
        .replace(' months ago', 'm')
        .replace(' month ago', 'm')
        .replace(' ago', '');
    }
    return timestamp;
  };

  return (
    <div
      class={`terminal-activity-block terminal-activity-block--track ${isTrackPlaying() ? 'terminal-activity-block--playing' : ''} ${props.className || ''}`}
    >
      {/* Top border */}
      <div class="terminal-block-header">
        <span>╭─────────────────────────────────────────────────────────────┬──[0x{getShortId()}]─╮</span>
      </div>

      {/* Metadata line (social context) */}
      <Show when={props.showSocialContext !== false && props.track.addedBy}>
        <div class="terminal-block-meta">
          <span class="border-v">│</span>
          <span class="meta-arrow">&gt;&gt;</span>
          <span class="meta-username">@{props.track.addedBy}</span>
          <span style={{ color: 'var(--terminal-text)' }}> shared a track</span>
          <Show when={props.track.timestamp}>
            <span class="info-separator"> • </span>
            <span class="info-value">{formatTimeAgo(props.track.timestamp)}</span>
          </Show>
          <span style={{ 'margin-left': 'auto' }}></span>
          <span class="border-v">│</span>
        </div>

        {/* Divider */}
        <div class="terminal-block-divider">
          <span>├─────────────────────────────────────────────────────────────┤</span>
        </div>
      </Show>

      {/* Content area with track thumbnail and info */}
      <div class="terminal-block-content">
        <span class="border-v">│</span>
        <div class="terminal-track-row">
          {/* Track thumbnail */}
          <div class="terminal-thumbnail">
            <div class="thumbnail-border-top">┌─┐</div>
            <Show when={!imageError()} fallback={
              <div style={{
                width: '56px',
                height: '56px',
                background: 'var(--terminal-muted)',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                color: 'var(--terminal-dim)',
                'font-size': '24px'
              }}>♪</div>
            }>
              <img
                src={props.track.thumbnail}
                alt=""
                class="thumbnail-image"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{
                  opacity: imageLoaded() ? 1 : 0,
                  transition: 'opacity 200ms'
                }}
              />
            </Show>
            <div class="thumbnail-border-bottom">└─┘</div>
          </div>

          {/* Track info */}
          <div class="terminal-track-info">
            <div class="track-title-line">
              <span class="track-title">"{props.track.title}"</span>
              <span class="track-source">[SRC: {props.track.source.toUpperCase()}]</span>
            </div>
            <div class="track-artist-line">
              <span class="track-label">by</span>
              <span class="track-artist">{props.track.artist}</span>
            </div>
          </div>
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Comment section */}
      <Show when={props.showComment !== false && props.track.comment}>
        <div class="terminal-block-comment">
          <span class="border-v">│</span>
          <span class="comment-arrow">&gt;&gt;</span>
          <span class="comment-label">COMMENT:</span>
          <span class="comment-text">"{props.track.comment}"</span>
          <span class="border-v">│</span>
        </div>
      </Show>

      {/* Actions */}
      <div class="terminal-block-actions">
        <span class="border-v">│</span>
        <div class="terminal-social-row">
          <button
            class="terminal-action-btn"
            onClick={handleLikeClick}
            aria-label={`${props.track.likes} likes`}
          >
            <span class="action-bracket">[</span>
            <span class="action-icon">❤</span>
            <span class="action-count"> {props.track.likes}</span>
            <span class="action-bracket">]</span>
          </button>

          <button
            class="terminal-action-btn"
            onClick={handleReplyClick}
            aria-label={`${props.track.replies} replies`}
          >
            <span class="action-bracket">[</span>
            <span class="action-icon">💬</span>
            <span class="action-count"> {props.track.replies}</span>
            <span class="action-bracket">]</span>
          </button>

          <button
            class="terminal-play-btn"
            onClick={handlePlayClick}
            aria-label={isTrackPlaying() ? 'Pause' : 'Play'}
          >
            <span class="action-bracket">[</span>
            <span class="play-icon">{isTrackPlaying() ? '⏸' : '▶'}</span>
            <span class="play-text">{isTrackPlaying() ? 'PAUSE' : 'PLAY'}</span>
            <span class="action-bracket">]</span>
          </button>
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Bottom border */}
      <div class="terminal-block-footer">
        <span>╰──────────────────────────────────────────────────────────────╯</span>
      </div>
    </div>
  );
};

export default HeroTrackCard;
