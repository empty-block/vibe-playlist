import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying, setIsPlaying } from '../../../../stores/playerStore';
import './rowCard.css';

interface RowTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onLike: (track: Track) => void;
  onReply: (track: Track) => void;
  showComment?: boolean;
  className?: string;
}

const RowTrackCard: Component<RowTrackCardProps> = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [imageError, setImageError] = createSignal(false);
  const [commentExpanded, setCommentExpanded] = createSignal(false);

  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  const handleCardClick = () => {
    if (isTrackPlaying()) {
      // If this track is playing, pause it
      setIsPlaying(false);
    } else {
      // Otherwise, play this track
      props.onPlay(props.track);
    }
  };

  const handleLikeClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onLike(props.track);
  };

  const handleReplyClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onReply(props.track);
  };

  const handleExpandClick = (e: MouseEvent) => {
    e.stopPropagation();
    setCommentExpanded(!commentExpanded());
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    const cutPoint = text.lastIndexOf(' ', maxLength);
    return text.substring(0, cutPoint > 0 ? cutPoint : maxLength);
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
      class={`row-card ${isTrackPlaying() ? 'row-card--playing' : ''} ${props.className || ''}`}
      onClick={handleCardClick}
    >
      {/* Main Row - REDESIGNED */}
      <div class="row-card__main">
        {/* Thumbnail */}
        <div class="row-card__thumbnail">
          <Show when={!imageError()} fallback={
            <div class="row-card__error">
              <span>🎵</span>
            </div>
          }>
            <img
              src={props.track.thumbnail}
              alt={`${props.track.title} album art`}
              class="row-card__image"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </Show>
        </div>

        {/* Info Column */}
        <div class="row-card__info">
          <div class="row-card__title-artist">
            {props.track.title}
            <span class="row-card__separator"> - </span>
            <span class="row-card__artist">{props.track.artist}</span>
          </div>
          <div class="row-card__context">
            <span class="row-card__shared-by-label">shared by</span>
            <span class="row-card__username">{props.track.addedBy}</span>
            <span class="row-card__separator-dot">•</span>
            <span class="row-card__timestamp">{formatTimeAgo(props.track.timestamp)}</span>
          </div>

          {/* Social Row - Third row within info column */}
          <div class="row-card__social-row">
            <button
              class="row-card__social-btn"
              onClick={handleReplyClick}
              aria-label={`${props.track.replies} replies`}
            >
              <span class="row-card__social-icon">💬</span>
              <span class="row-card__social-count">{props.track.replies} replies</span>
            </button>
            <button
              class="row-card__social-btn"
              onClick={handleLikeClick}
              aria-label={`${props.track.likes} likes`}
            >
              <span class="row-card__social-icon">❤️</span>
              <span class="row-card__social-count">{props.track.likes} likes</span>
            </button>
          </div>
        </div>

        {/* Platform Badge */}
        <div class="row-card__platform">{getPlatformIcon(props.track.source)}</div>
      </div>

      {/* Comment Row - Only if comment exists */}
      <Show when={props.showComment !== false && props.track.comment}>
        <div class="row-card__comment-row">
          {/* Comment text - expandable */}
          <div
            class="row-card__comment-text"
            onClick={props.track.comment.length > 60 ? handleExpandClick : undefined}
          >
            <div class={commentExpanded() ? "row-card__comment row-card__comment--expanded" : "row-card__comment"}>
              {commentExpanded() ? props.track.comment : truncateText(props.track.comment, 60)}
            </div>
          </div>

          {/* Expand arrow - separate column on far right */}
          <Show when={props.track.comment && props.track.comment.length > 60}>
            <div class="row-card__expand-column">
              <button
                class="row-card__expand-btn"
                onClick={handleExpandClick}
                aria-label={commentExpanded() ? "Collapse comment" : "Expand comment"}
              >
                {commentExpanded() ? '▲' : '▼'}
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default RowTrackCard;