import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying } from '../../../../stores/playerStore';
import '../../../../styles/terminal.css';

interface CompactTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  className?: string;
}

const CompactTrackCard: Component<CompactTrackCardProps> = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [imageError, setImageError] = createSignal(false);

  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  const handlePlayClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onPlay(props.track);
  };

  const getShortId = () => {
    return props.track.id.slice(-4).toUpperCase();
  };

  return (
    <div
      class={`terminal-activity-block terminal-activity-block--track ${isTrackPlaying() ? 'terminal-activity-block--playing' : ''} ${props.className || ''}`}
      onClick={() => props.onPlay(props.track)}
    >
      {/* Top border */}
      <div class="terminal-block-header">
        <span>╭─────────────────────────────────────────────────────────────┬──[0x{getShortId()}]─╮</span>
      </div>

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

      {/* Actions */}
      <div class="terminal-block-actions">
        <span class="border-v">│</span>
        <div class="terminal-social-row">
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

export default CompactTrackCard;
