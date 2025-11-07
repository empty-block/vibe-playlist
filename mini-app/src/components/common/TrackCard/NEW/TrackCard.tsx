import { Component, Show, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { currentTrack, isPlaying } from '../../../../stores/playerStore';
import { stripUrls } from '../../../../utils/textUtils';

const MAX_TEXT_LENGTH = 200;

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
  castHash?: string; // For opening cast in Farcaster to like/recast
  onPlay: (track: any) => void;
  onUsernameClick?: (fid: string, e: MouseEvent) => void;
}

// Format time ago helper
const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const TrackCard: Component<TrackCardProps> = (props) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = createSignal(false);
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

  // Open cast in Farcaster client for like/recast
  const handleLikeClick = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!props.castHash) {
      console.log('[TrackCard] No castHash available');
      return;
    }

    try {
      const { default: sdk } = await import('@farcaster/miniapp-sdk');
      // viewCast takes an object with hash property
      console.log('[TrackCard] Opening cast with hash:', props.castHash);
      await sdk.actions.viewCast({
        hash: props.castHash
      });
    } catch (error) {
      console.error('[TrackCard] Failed to open cast:', error);
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
              <span class="channel-separator">•</span>
              <span class="channel-link" onClick={handleChannelClick}>{props.channelId}</span>
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
        </div>
        <button
          class="open-button"
          onClick={() => props.onPlay({
            id: props.track.id,
            title: props.track.title,
            artist: props.track.artist,
            thumbnail: props.track.thumbnail,
            source: props.track.platform,
            url: props.track.url,
            sourceId: props.track.platformId
          })}
          title="Open track in player"
        >
          ▼
        </button>
      </div>

      {/* Comment if present */}
      <Show when={props.text && props.text.trim()}>
        {(() => {
          const cleanText = stripUrls(props.text!);
          const isLongText = cleanText.length > MAX_TEXT_LENGTH;

          return (
            <div class="comment-box">
              <Show
                when={isLongText && !isExpanded()}
                fallback={<>{cleanText}</>}
              >
                {cleanText.substring(0, MAX_TEXT_LENGTH)}...
              </Show>
              <Show when={isLongText}>
                <button
                  class="show-more-btn"
                  onClick={() => setIsExpanded(!isExpanded())}
                >
                  {isExpanded() ? 'Show less' : 'Show more'}
                </button>
              </Show>
            </div>
          );
        })()}
      </Show>

      {/* Stats row */}
      <div class="stats-row">
        <div
          class="stat-box clickable"
          onClick={handleLikeClick}
          style={{ cursor: props.castHash ? 'pointer' : 'default' }}
          title={props.castHash ? 'Open in Farcaster to like' : ''}
        >
          <span>♥</span>
          <span class="count">{props.stats.likes || 0}</span>
          <span class="label">likes</span>
        </div>
        <div class="stat-box">
          <span>💬</span>
          <span class="count">{props.stats.replies || 0}</span>
          <span class="label">replies</span>
        </div>
        <div class="music-source">
          via {(() => {
            const platform = props.track.platform.toLowerCase();
            if (platform === 'youtube' || platform === 'youtube_music') return 'YouTube';
            if (platform === 'spotify') return 'Spotify';
            if (platform === 'soundcloud') return 'SoundCloud';
            if (platform === 'apple_music') return 'Apple Music';
            if (platform === 'audius') return 'Audius';
            if (platform === 'bandcamp') return 'Bandcamp';
            if (platform === 'tidal') return 'Tidal';
            // Capitalize first letter for unknown platforms
            return platform.charAt(0).toUpperCase() + platform.slice(1);
          })()}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
