import { Component, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
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
  channelId?: string;
  channelName?: string;
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
  const navigate = useNavigate();
  const isCurrentTrack = () => currentTrack()?.id === props.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  const handleUsernameClick = (e: MouseEvent) => {
    if (props.onUsernameClick) {
      props.onUsernameClick(props.author.fid, e);
    }
  };

  const handleChannelClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.channelId) {
      navigate(`/channels/${props.channelId}`);
    }
  };

  return (
    <div class="terminal-track-card activity-card">
      {/* Navy header bar */}
      <div class="activity-header">
        <div class="user-info">
          <Show when={props.author.pfpUrl} fallback={
            <div class="user-avatar-fallback">
              {props.author.username.charAt(0).toUpperCase()}
            </div>
          }>
            <img
              src={props.author.pfpUrl}
              alt={props.author.username}
              class="user-avatar"
            />
          </Show>
          <div class="user-text">
            <span
              class="username"
              onClick={handleUsernameClick}
              style={{ cursor: props.onUsernameClick ? 'pointer' : 'default' }}
            >
              {props.author.username}
            </span>
            <Show when={props.channelId && props.channelName && props.channelName !== props.channelId && props.channelId !== 'unknown'}>
              <span class="channel-info">
                shared in{' '}
                <span
                  class="channel-link"
                  onClick={handleChannelClick}
                >
                  {props.channelId}
                </span>
              </span>
            </Show>
          </div>
        </div>
        <span class="timestamp">{formatTimeAgo(props.timestamp)}</span>
      </div>

      {/* Track content */}
      <div class="track-content">
        <div class="thumbnail">
          <Show when={props.track.thumbnail} fallback={<span>🎵</span>}>
            <img src={props.track.thumbnail} alt={props.track.title} />
          </Show>
        </div>
        <div class="track-info">
          <div class="track-title">{props.track.title}</div>
          <div class="track-artist">{props.track.artist}</div>
          <div class="track-meta">via {props.track.platform}</div>
        </div>
        <button
          class="play-button"
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
        <div class="comment-box">
          {props.text}
        </div>
      </Show>

      {/* Stats row */}
      <div class="stats-row">
        <div class="stat-box">
          <span>♥</span>
          <span class="count">{props.stats.likes || 0}</span>
        </div>
        <div class="stat-box">
          <span>💬</span>
          <span class="count">{props.stats.replies || 0}</span>
        </div>
        <div class="stat-box">
          <span>🔄</span>
          <span class="count">{props.stats.recasts || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
