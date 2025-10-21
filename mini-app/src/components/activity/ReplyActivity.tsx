import { Component, Show } from 'solid-js';
import { ReplyActivity as ReplyActivityType } from '../../data/mockActivity';
import { setCurrentTrack, setIsPlaying, currentTrack, isPlaying } from '../../stores/playerStore';

interface ReplyActivityProps {
  activity: ReplyActivityType;
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

const ReplyActivity: Component<ReplyActivityProps> = (props) => {
  const handleTrackPlay = () => {
    const track = {
      id: props.activity.track.id,
      title: props.activity.track.title,
      artist: props.activity.track.artist,
      thumbnail: props.activity.track.thumbnail,
      source: props.activity.track.source,
      url: props.activity.track.url,
      sourceId: props.activity.track.sourceId
    };

    const isCurrentTrack = currentTrack()?.id === track.id;
    const isTrackPlaying = isCurrentTrack && isPlaying();

    if (isTrackPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const isCurrentTrack = () => currentTrack()?.id === props.activity.track.id;
  const isTrackPlaying = () => isCurrentTrack() && isPlaying();

  return (
    <div class="activity-card">
      {/* Navy header bar */}
      <div class="activity-header">
        <div class="user-info">
          <Show when={props.activity.user.pfp} fallback={
            <div class="user-avatar-fallback">{props.activity.user.username.charAt(0).toUpperCase()}</div>
          }>
            <img src={props.activity.user.pfp} alt={props.activity.user.username} class="user-avatar" />
          </Show>
          <span class="username">
            {props.activity.user.username}
            <span style={{ 'font-weight': 'normal', 'margin-left': '4px' }}>• replied to track</span>
          </span>
        </div>
        <span class="timestamp">{formatTimeAgo(props.activity.timestamp)}</span>
      </div>

      {/* Track content */}
      <div class="track-content">
        <div class="thumbnail">
          <Show when={props.activity.track.thumbnail} fallback={<span>🎵</span>}>
            <img src={props.activity.track.thumbnail} alt={props.activity.track.title} />
          </Show>
        </div>
        <div class="track-info">
          <div class="track-title">{props.activity.track.title}</div>
          <div class="track-artist">{props.activity.track.artist}</div>
          <div class="track-meta">via {props.activity.track.source}</div>
        </div>
        <button
          class="play-button"
          onClick={handleTrackPlay}
        >
          {isTrackPlaying() ? '⏸' : '▶'}
        </button>
      </div>

      {/* Reply text in comment box */}
      <Show when={props.activity.track.comment && props.activity.track.comment.trim()}>
        <div class="comment-box">
          {props.activity.track.comment}
        </div>
      </Show>

      {/* Stats row */}
      <div class="stats-row">
        <div class="stat-box">
          <span>♥</span>
          <span class="count">{props.activity.track.likes || 0}</span>
        </div>
        <div class="stat-box">
          <span>💬</span>
          <span class="count">{props.activity.track.replies || 0}</span>
        </div>
        <div class="stat-box">
          <span>🔄</span>
          <span class="count">{props.activity.track.recasts || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ReplyActivity;
