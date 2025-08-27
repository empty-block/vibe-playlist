import { Component, createSignal, Show, onMount, createEffect } from 'solid-js';
import { Track, setCurrentTrack, setIsPlaying, currentTrack, isPlaying } from '../../stores/playlistStore';
import SocialStats from '../social/SocialStats';
import RetroTooltip from '../ui/RetroTooltip';

interface LibraryTableRowProps {
  track: Track;
  trackNumber: number;
}

const LibraryTableRow: Component<LibraryTableRowProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [isTitleTruncated, setIsTitleTruncated] = createSignal(false);
  const [isArtistTruncated, setIsArtistTruncated] = createSignal(false);
  const [isCommentTruncated, setIsCommentTruncated] = createSignal(false);
  
  let titleRef: HTMLDivElement | undefined;
  let artistRef: HTMLDivElement | undefined;
  let commentRef: HTMLDivElement | undefined;
  
  const checkTruncation = () => {
    if (titleRef) {
      setIsTitleTruncated(titleRef.scrollWidth > titleRef.clientWidth);
    }
    if (artistRef) {
      setIsArtistTruncated(artistRef.scrollWidth > artistRef.clientWidth);
    }
    if (commentRef) {
      setIsCommentTruncated(commentRef.scrollHeight > commentRef.clientHeight);
    }
  };
  
  onMount(() => {
    checkTruncation();
    // Check again on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  });
  
  createEffect(() => {
    // Re-check when props change
    props.track;
    setTimeout(checkTruncation, 0);
  });

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
      {/* Track Number Column */}
      <td class="retro-grid-cell w-12 text-center">
        <span 
          class="font-mono text-sm font-bold"
          style={{
            color: isCurrentTrack() ? '#00f92a' : 'rgba(204, 204, 204, 0.8)',
            'text-shadow': isCurrentTrack() ? '0 0 3px rgba(0, 249, 42, 0.6)' : 'none'
          }}
        >
          {String(props.trackNumber).padStart(2, '0')}
        </span>
      </td>

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
          <div class="min-w-0 flex-1">
            <Show 
              when={isTitleTruncated()} 
              fallback={
                <div ref={titleRef} class="retro-track-title truncate">
                  {props.track.title}
                </div>
              }
            >
              <RetroTooltip content={props.track.title} delay={200}>
                <div ref={titleRef} class="retro-track-title truncate cursor-help">
                  {props.track.title}
                </div>
              </RetroTooltip>
            </Show>
          </div>
        </div>
      </td>

      {/* Artist Column */}
      <td class="retro-grid-cell">
        <Show 
          when={isArtistTruncated()} 
          fallback={
            <div ref={artistRef} class="retro-track-artist truncate">
              {props.track.artist}
            </div>
          }
        >
          <RetroTooltip content={props.track.artist} delay={200}>
            <div ref={artistRef} class="retro-track-artist truncate cursor-help">
              {props.track.artist}
            </div>
          </RetroTooltip>
        </Show>
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

      {/* Context Column */}
      <td class="retro-grid-cell">
        <Show 
          when={props.track.comment && isCommentTruncated()} 
          fallback={
            <div ref={commentRef} class="text-sm text-white/60 line-clamp-2 font-mono">
              {props.track.comment || <span class="text-gray-500 italic">No comment</span>}
            </div>
          }
        >
          <RetroTooltip content={props.track.comment || ''} maxWidth={400} delay={200}>
            <div ref={commentRef} class="text-sm text-white/60 line-clamp-2 font-mono cursor-help">
              {props.track.comment}
            </div>
          </RetroTooltip>
        </Show>
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

      {/* Replies Column */}
      <td class="retro-grid-cell">
        <div class="flex items-center gap-1 text-sm font-mono">
          <span class="text-blue-400">💬</span>
          <span class="text-blue-400">{props.track.replies}</span>
        </div>
      </td>

      {/* Likes Column */}
      <td class="retro-grid-cell">
        <div class="flex items-center gap-1 text-sm font-mono">
          <span class="text-red-400">❤</span>
          <span class="text-red-400">{props.track.likes}</span>
        </div>
      </td>
    </tr>
  );
};

export default LibraryTableRow;