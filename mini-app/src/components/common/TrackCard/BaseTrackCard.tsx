import { Component, createSignal, Show } from 'solid-js';
import { Track, currentTrack, isPlaying } from '../../../stores/playerStore';
import { PersonalTrack } from '../../library/LibraryTableRow';
import { CompactLayout, DetailedLayout, GridLayout, ListLayout } from './TrackCardVariants';
import './trackCard.css';
import './trackCardVariants.css';

interface BaseTrackCardProps {
  track: Track | PersonalTrack;
  variant?: 'compact' | 'detailed' | 'grid' | 'list';
  showSocialActions?: boolean;
  showUserContext?: boolean;
  showExpandableComment?: boolean;
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onReply?: (track: Track) => void;
  className?: string;
}

const BaseTrackCard: Component<BaseTrackCardProps> = (props) => {
  const variant = () => props.variant || 'detailed';
  const [isHovered, setIsHovered] = createSignal(false);

  const handleCardClick = () => {
    if (props.onPlay) {
      props.onPlay(props.track);
    }
  };

  const isCurrentTrack = () => {
    return currentTrack()?.id === props.track.id;
  };

  const isTrackPlaying = () => {
    return isCurrentTrack() && isPlaying();
  };

  const cardClasses = () => {
    const classes = [
      'track-card',
      `track-card--${variant()}`,
      props.className
    ];

    if (isCurrentTrack()) {
      classes.push('track-card--current');
    }

    if (isHovered()) {
      classes.push('track-card--hovered');
    }

    return classes.filter(Boolean).join(' ');
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
    if (isNaN(date.getTime())) {
      return timestamp;
    }

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

  const commonProps = () => ({
    track: props.track,
    showSocialActions: props.showSocialActions,
    showUserContext: props.showUserContext,
    showExpandableComment: props.showExpandableComment,
    onPlay: props.onPlay,
    onLike: props.onLike,
    onReply: props.onReply,
    formatTimeAgo,
    isCurrentTrack: isCurrentTrack(),
    isPlaying: isTrackPlaying()
  });

  return (
    <div
      class={cardClasses()}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${props.track.title} by ${props.track.artist}`}
    >
      <Show when={variant() === 'compact'}>
        <CompactLayout {...commonProps()} />
      </Show>

      <Show when={variant() === 'detailed'}>
        <DetailedLayout {...commonProps()} />
      </Show>

      <Show when={variant() === 'grid'}>
        <GridLayout {...commonProps()} />
      </Show>

      <Show when={variant() === 'list'}>
        <ListLayout {...commonProps()} />
      </Show>
    </div>
  );
};

export default BaseTrackCard;