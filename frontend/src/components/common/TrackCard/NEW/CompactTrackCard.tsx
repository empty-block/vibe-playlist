import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying } from '../../../../stores/playerStore';
import './compactCard.css';

interface CompactTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  className?: string;
}

const CompactTrackCard: Component<CompactTrackCardProps> = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [imageError, setImageError] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);

  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  const handleCardClick = () => {
    props.onPlay(props.track);
  };

  const handlePlayClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onPlay(props.track);
  };

  const getPlatformIcon = (source: string) => {
    switch (source) {
      case 'youtube': return '📺';
      case 'spotify': return '🟢';
      case 'soundcloud': return '🧡';
      case 'bandcamp': return '🔵';
      default: return '🎵';
    }
  };

  return (
    <div
      class={`compact-card ${isTrackPlaying() ? 'compact-card--playing' : ''} ${props.className || ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album Art Section */}
      <div class="compact-card__image-container">
        {/* Loading skeleton */}
        <Show when={!imageLoaded() && !imageError()}>
          <div class="compact-card__skeleton" />
        </Show>

        {/* Album Image */}
        <Show when={!imageError()} fallback={
          <div class="compact-card__error">
            <span class="compact-card__error-icon">🎵</span>
          </div>
        }>
          <img
            src={props.track.thumbnail}
            alt={`${props.track.title} album art`}
            class="compact-card__image"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </Show>

        {/* Platform Badge */}
        <div class="compact-card__platform-badge">
          {getPlatformIcon(props.track.source)}
        </div>

        {/* Play Button Overlay (only on hover) */}
        <Show when={isHovered() || isTrackPlaying()}>
          <div class="compact-card__play-overlay">
            <button
              class="compact-card__play-button"
              onClick={handlePlayClick}
              aria-label={isTrackPlaying() ? 'Pause' : 'Play'}
            >
              <span>{isTrackPlaying() ? '⏸' : '▶'}</span>
            </button>
          </div>
        </Show>
      </div>

      {/* Text Section */}
      <div class="compact-card__text">
        <div class="compact-card__title">{props.track.title}</div>
        <div class="compact-card__artist">{props.track.artist}</div>
      </div>
    </div>
  );
};

export default CompactTrackCard;