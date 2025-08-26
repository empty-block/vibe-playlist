import { Component, createSignal } from 'solid-js';
import { Track, setCurrentTrack, setIsPlaying, currentTrack, isPlaying } from '../../stores/playlistStore';
import SocialStats from '../social/SocialStats';

interface LibraryTableRowProps {
  track: Track;
}

const LibraryTableRow: Component<LibraryTableRowProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);

  const handlePlayTrack = () => {
    setCurrentTrack(props.track);
    setIsPlaying(true);
  };

  const formatTimeAgo = (timestamp: string) => {
    // If it's already a relative time string (from mock data), return as-is
    if (timestamp.includes('ago') || timestamp === 'now') {
      return timestamp;
    }
    
    // Otherwise, format the actual timestamp
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp; // Return original if unparseable
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

  const getPlatformIcon = (source: string) => {
    switch (source) {
      case 'youtube':
        return '📺';
      case 'spotify':
        return '🟢';
      case 'soundcloud':
        return '🧡';
      case 'bandcamp':
        return '🔵';
      default:
        return '🎵';
    }
  };

  const getPlatformClass = (source: string) => {
    switch (source) {
      case 'youtube':
        return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'spotify':
        return 'bg-green-500/20 border-green-500/40 text-green-400';
      case 'soundcloud':
        return 'bg-orange-500/20 border-orange-500/40 text-orange-400';
      case 'bandcamp':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    }
  };

  const isCurrentTrack = () => {
    return currentTrack()?.id === props.track.id;
  };

  const isTrackPlaying = () => {
    return isCurrentTrack() && isPlaying();
  };

  return (
    <tr
      class={`retro-grid-row ${isCurrentTrack() ? 'current-track' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDblClick={handlePlayTrack}
    >
      {/* Track Column */}
      <td class="retro-grid-cell">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img
              src={props.track.thumbnail}
              alt={props.track.title}
              class="w-12 h-12 rounded-lg border border-cyan-400/30 object-cover"
            />
            {(isHovered() || isTrackPlaying()) && (
              <div class="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack();
                  }}
                  class="text-white text-xl hover:text-cyan-400 transition-colors"
                >
                  {isTrackPlaying() ? '⏸' : '▶'}
                </button>
              </div>
            )}
          </div>
          <div>
            <div class="retro-track-title line-clamp-1">
              {props.track.title}
            </div>
            <div class="retro-track-duration">
              {props.track.duration}
            </div>
          </div>
        </div>
      </td>

      {/* Artist Column */}
      <td class="retro-grid-cell">
        <div class="retro-track-artist line-clamp-1">
          {props.track.artist}
        </div>
      </td>

      {/* Shared By Column */}
      <td class="retro-grid-cell">
        <div class="flex items-center gap-2">
          <span class="text-lg">{props.track.userAvatar}</span>
          <span class="retro-user-name">
            {props.track.addedBy}
          </span>
        </div>
      </td>

      {/* When Column */}
      <td class="retro-grid-cell">
        <span class="retro-timestamp">
          {formatTimeAgo(props.track.timestamp)}
        </span>
      </td>

      {/* Platform Column */}
      <td class="retro-grid-cell">
        <div class={`retro-platform-badge ${props.track.source}`}>
          <span>{getPlatformIcon(props.track.source)}</span>
          <span class="capitalize">{props.track.source}</span>
        </div>
      </td>

      {/* Context Column */}
      <td class="retro-grid-cell">
        <div class="text-sm text-white/60 line-clamp-2 max-w-[200px] font-mono">
          {props.track.comment || <span class="text-gray-500 italic">No comment</span>}
        </div>
      </td>

      {/* Tags Column */}
      <td class="retro-grid-cell">
        <div class="flex flex-wrap gap-1">
          {props.track.tags?.map((tag) => (
            <span class="px-2 py-1 text-xs bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded font-mono">
              #{tag}
            </span>
          )) || <span class="text-gray-500 italic text-xs">No tags</span>}
        </div>
      </td>

      {/* Community Column (simplified - just likes and replies) */}
      <td class="retro-grid-cell">
        <div class="flex items-center gap-4 text-sm font-mono">
          <div class="flex items-center gap-1">
            <span class="text-red-400">❤</span>
            <span class="text-red-400">{props.track.likes}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-blue-400">💬</span>
            <span class="text-blue-400">{props.track.replies}</span>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default LibraryTableRow;