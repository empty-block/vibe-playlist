import { Component, Show } from 'solid-js';
import { currentTrack, isPlaying } from '../../../../stores/playerStore';

interface TrackCardProps {
  author: {
    fid: string;
    username: string;
    pfpUrl?: string;
  };
  track: {
    id: string;
    title: string;
    artist: string;
    thumbnail?: string;
    platform: string;
    url: string;
    platformId: string;
  };
  text?: string;
  timestamp: string;
  stats: {
    likes: number;
    replies: number;
    recasts: number;
  };
  onPlay: (track: any) => void;
  onUsernameClick?: (fid: string, e: MouseEvent) => void;
}

// Format time ago helper
const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}m ago`;
};

const TrackCard: Component<TrackCardProps> = (props) => {
  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  const handleUsernameClick = (e: MouseEvent) => {
    if (props.onUsernameClick) {
      props.onUsernameClick(props.author.fid, e);
    }
  };

  return (
    <div class="win95-activity-card">
      {/* Navy header bar */}
      <div class="win95-activity-header">
        <div class="win95-user-info">
          <Show when={props.author.pfpUrl} fallback={
            <div class="win95-user-avatar-fallback">
              {props.author.username.charAt(0).toUpperCase()}
            </div>
          }>
            <img
              src={props.author.pfpUrl}
              alt={props.author.username}
              class="win95-user-avatar"
            />
          </Show>
          <span
            class="win95-username"
            onClick={handleUsernameClick}
            style={{ cursor: props.onUsernameClick ? 'pointer' : 'default' }}
          >
            {props.author.username}
          </span>
        </div>
        <span class="win95-timestamp">{formatTimeAgo(props.timestamp)}</span>
      </div>

      {/* Track content */}
      <div class="win95-track-content">
        <div class="win95-thumbnail">
          <Show when={props.track.thumbnail} fallback={<span>🎵</span>}>
            <img src={props.track.thumbnail} alt={props.track.title} />
          </Show>
        </div>
        <div class="win95-track-info">
          <div class="win95-track-title">{props.track.title}</div>
          <div class="win95-track-artist">{props.track.artist}</div>
          <div class="win95-track-meta">via {props.track.platform}</div>
        </div>
        <button
          class="win95-play-button"
          onClick={() => props.onPlay({
            id: props.track.id,
            title: props.track.title,
            artist: props.track.artist,
            thumbnail: props.track.thumbnail,
            source: props.track.platform,
            url: props.track.url,
            sourceId: props.track.platformId
          })}
        >
          {isTrackPlaying() ? '⏸' : '▶'}
        </button>
      </div>

      {/* Comment if present */}
      <Show when={props.text && props.text.trim()}>
        <div class="win95-comment-box">
          {props.text}
        </div>
      </Show>

      {/* Stats row */}
      <div class="win95-stats-row">
        <div class="win95-stat-box">
          <span>♥</span>
          <span class="count">{props.stats.likes || 0}</span>
        </div>
        <div class="win95-stat-box">
          <span>💬</span>
          <span class="count">{props.stats.replies || 0}</span>
        </div>
        <div class="win95-stat-box">
          <span>🔄</span>
          <span class="count">{props.stats.recasts || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
