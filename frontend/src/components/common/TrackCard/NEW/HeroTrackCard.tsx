import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying } from '../../../../stores/playerStore';
import './heroCard.css';

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

  const handleCardClick = () => {
    props.onPlay(props.track);
  };

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

  const getPlatformIcon = (source: string) => {
    switch (source) {
      case 'youtube': return '📺';
      case 'spotify': return '🟢';
      case 'soundcloud': return '🧡';
      case 'bandcamp': return '🔵';
      default: return '🎵';
    }
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
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
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
    <div
      class={`hero-card ${isTrackPlaying() ? 'hero-card--playing' : ''} ${props.className || ''}`}
      onClick={handleCardClick}
    >
      {/* Album Art Section */}
      <div class="hero-card__image-container">
        {/* Loading skeleton */}
        <Show when={!imageLoaded() && !imageError()}>
          <div class="hero-card__skeleton" />
        </Show>

        {/* Album Image */}
        <Show when={!imageError()} fallback={
          <div class="hero-card__error">
            <span class="hero-card__error-icon">🎵</span>
          </div>
        }>
          <img
            src={props.track.thumbnail}
            alt={`${props.track.title} album art`}
            class="hero-card__image"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </Show>

        {/* Platform Badge */}
        <div class="hero-card__platform-badge">
          {getPlatformIcon(props.track.source)}
        </div>

        {/* Bottom Gradient Overlay */}
        <div class="hero-card__overlay" />

        {/* Text Overlay - REDESIGNED */}
        <div class="hero-card__text-overlay">
          {/* Combined Title-Artist */}
          <div class="hero-card__title-artist">
            {props.track.title}
            <span class="hero-card__title-artist-separator"> - </span>
            <span class="hero-card__artist-name">{props.track.artist}</span>
          </div>

          {/* Inline Context */}
          <Show when={props.showSocialContext !== false}>
            <div class="hero-card__context">
              <span class="hero-card__username">@{props.track.addedBy}</span>
              <span class="hero-card__context-separator">•</span>
              <span class="hero-card__timestamp">{formatTimeAgo(props.track.timestamp)}</span>
            </div>
          </Show>
        </div>
      </div>

      {/* Action Bar */}
      <div class="hero-card__actions">
        <div class="hero-card__social-stats">
          <button
            class="hero-card__stat"
            onClick={handleReplyClick}
            aria-label={`${props.track.replies} replies`}
          >
            <span>💬</span>
            <span>{props.track.replies}</span>
          </button>
          <button
            class="hero-card__stat"
            onClick={handleLikeClick}
            aria-label={`${props.track.likes} likes`}
          >
            <span>❤️</span>
            <span>{props.track.likes}</span>
          </button>
        </div>

        <button
          class="hero-card__play-button"
          onClick={handlePlayClick}
          aria-label={isTrackPlaying() ? 'Pause' : 'Play'}
        >
          <span>{isTrackPlaying() ? '⏸' : '▶'}</span>
        </button>
      </div>
    </div>
  );
};

export default HeroTrackCard;