import { Component, createSignal, Show, onMount, createEffect } from 'solid-js';
import { Track, setCurrentTrack, setIsPlaying, currentTrack, isPlaying } from '../../stores/playlistStore';
import { PersonalTrack } from './PersonalLibraryTable';
import RetroTooltip from '../ui/RetroTooltip';

interface PersonalLibraryTableRowProps {
  track: PersonalTrack;
  trackNumber: number;
}

const PersonalLibraryTableRow: Component<PersonalLibraryTableRowProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [isTitleTruncated, setIsTitleTruncated] = createSignal(false);
  const [isArtistTruncated, setIsArtistTruncated] = createSignal(false);
  const [isContextTruncated, setIsContextTruncated] = createSignal(false);
  
  let titleRef: HTMLDivElement | undefined;
  let artistRef: HTMLDivElement | undefined;
  let contextRef: HTMLDivElement | undefined;
  
  const checkTruncation = () => {
    if (titleRef) {
      setIsTitleTruncated(titleRef.scrollWidth > titleRef.clientWidth);
    }
    if (artistRef) {
      setIsArtistTruncated(artistRef.scrollWidth > artistRef.clientWidth);
    }
    if (contextRef) {
      setIsContextTruncated(contextRef.scrollHeight > contextRef.clientHeight);
    }
  };
  
  onMount(() => {
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  });
  
  createEffect(() => {
    props.track;
    setTimeout(checkTruncation, 0);
  });

  const handlePlayTrack = () => {
    setCurrentTrack(props.track);
    setIsPlaying(true);
  };

  const formatTimeAgo = (timestamp: string) => {
    if (timestamp.includes('ago') || timestamp === 'now') {
      return timestamp;
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

  const getPlatformIcon = (source: string) => {
    switch (source) {
      case 'youtube': return '📺';
      case 'spotify': return '🟢';
      case 'soundcloud': return '🧡';
      case 'bandcamp': return '🔵';
      default: return '🎵';
    }
  };

  const getInteractionIcon = (type: PersonalTrack['userInteraction']['type']) => {
    switch (type) {
      case 'shared': return '🎵';
      case 'liked': return '💖';
      case 'conversation': return '💬';
      case 'recast': return '🔄';
      default: return '📝';
    }
  };

  const getInteractionColor = (type: PersonalTrack['userInteraction']['type']) => {
    switch (type) {
      case 'shared': return 'text-pink-400 border-pink-400/30 bg-pink-400/10';
      case 'liked': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'conversation': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'recast': return 'text-green-400 border-green-400/30 bg-green-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getInteractionLabel = (type: PersonalTrack['userInteraction']['type']) => {
    switch (type) {
      case 'shared': return 'Shared';
      case 'liked': return 'Liked';
      case 'conversation': return 'Reply';
      case 'recast': return 'Recast';
      default: return 'Activity';
    }
  };

  const isCurrentTrack = () => {
    return currentTrack()?.id === props.track.id;
  };

  const isTrackPlaying = () => {
    return isCurrentTrack() && isPlaying();
  };

  // Add personal highlight for tracks you've shared
  const getRowClass = () => {
    const baseClass = `retro-grid-row personal-track-row ${isCurrentTrack() ? 'current-track' : ''}`;
    if (props.track.userInteraction.type === 'shared') {
      return `${baseClass} personal-track-shared`;
    }
    return baseClass;
  };

  return (
    <tr
      class={getRowClass()}
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

      {/* My Interaction Column */}
      <td class="retro-grid-cell">
        <div class={`flex items-center gap-2 px-2 py-1 rounded border text-xs font-semibold ${getInteractionColor(props.track.userInteraction.type)}`}>
          <span class="text-sm">{getInteractionIcon(props.track.userInteraction.type)}</span>
          <span>{getInteractionLabel(props.track.userInteraction.type)}</span>
        </div>
      </td>

      {/* Context Column */}
      <td class="retro-grid-cell">
        {props.track.userInteraction.context ? (
          <Show 
            when={isContextTruncated()} 
            fallback={
              <div ref={contextRef} class="text-xs text-white/50 line-clamp-1 font-mono italic">
                "{props.track.userInteraction.context}"
              </div>
            }
          >
            <RetroTooltip content={`"${props.track.userInteraction.context}"`} maxWidth={300} delay={200}>
              <div ref={contextRef} class="text-xs text-white/50 line-clamp-1 font-mono italic cursor-help">
                "{props.track.userInteraction.context}"
              </div>
            </RetroTooltip>
          </Show>
        ) : (
          <span class="text-gray-500 italic text-xs">No comment</span>
        )}
      </td>

      {/* When Column */}
      <td class="retro-grid-cell">
        <span class="retro-timestamp">
          {formatTimeAgo(props.track.userInteraction.timestamp)}
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

export default PersonalLibraryTableRow;