import { Component, createSignal, Show, onMount, createEffect, For } from 'solid-js';
import { Track, setCurrentTrack, setIsPlaying, currentTrack, isPlaying } from '../../stores/playerStore';
import SocialStats from '../social/SocialStats';
import RetroTooltip from '../ui/RetroTooltip';
import ExpandableText from '../ui/ExpandableText';
import { heartBeat, particleBurst, socialButtonClick } from '../../utils/animations';
import { enterThreadMode } from '../../stores/threadStore';
import { RowTrackCard } from '../common/TrackCard/NEW';

// Import PersonalTrack from LibraryTable
export interface PersonalTrack extends Track {
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast';
    timestamp: string;
    context?: string;
    socialStats?: {
      likes: number;
      replies: number;
      recasts: number;
    };
  };
}

interface LibraryTableRowProps {
  track: Track | PersonalTrack;
  trackNumber: number;
  mode?: 'library' | 'profile';
  isMobile?: boolean;
}

const LibraryTableRow: Component<LibraryTableRowProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [isTitleTruncated, setIsTitleTruncated] = createSignal(false);
  const [isArtistTruncated, setIsArtistTruncated] = createSignal(false);
  const [isLiked, setIsLiked] = createSignal(false);
  const [likeCount, setLikeCount] = createSignal(props.track.likes);
  const [replyCount, setReplyCount] = createSignal(props.track.replies);

  const isProfileMode = () => props.mode === 'profile';
  const isPersonalTrack = (track: Track | PersonalTrack): track is PersonalTrack => {
    return 'userInteraction' in track;
  };
  
  let titleRef: HTMLDivElement | undefined;
  let artistRef: HTMLDivElement | undefined;
  let likeButtonRef: HTMLButtonElement | undefined;
  let chatButtonRef: HTMLButtonElement | undefined;
  
  const checkTruncation = () => {
    if (titleRef) {
      setIsTitleTruncated(titleRef.scrollWidth > titleRef.clientWidth);
    }
    if (artistRef) {
      setIsArtistTruncated(artistRef.scrollWidth > artistRef.clientWidth);
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
    // Handle undefined or null timestamps
    if (!timestamp) return '';
    
    // If it's already a relative time string, convert to compact format
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
    
    // Parse actual timestamp and return compact format
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
        return 'bg-[#e010e0]/20 border-[#e010e0]/40 text-[#e010e0]';
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

  // Profile mode Activity column helpers
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

  const handleLikeClick = (e: Event) => {
    e.stopPropagation();
    if (likeButtonRef) {
      if (isLiked()) {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        socialButtonClick(likeButtonRef);
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        heartBeat(likeButtonRef);
        particleBurst(likeButtonRef);
      }
    }
  };

  const handleChatClick = (e: Event) => {
    e.stopPropagation();
    if (chatButtonRef) {
      socialButtonClick(chatButtonRef);
      // Enter thread mode with this track as the starter
      enterThreadMode(props.track);
    }
  };


  // Mobile Card Layout - Using NEW RowTrackCard
  if (props.isMobile) {
    return (
      <RowTrackCard
        track={props.track}
        onPlay={handlePlayTrack}
        onLike={handleLikeClick}
        onReply={handleChatClick}
        showComment={true}
      />
    );
  }

  // Desktop Table Layout
  return (
    <>
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
          <div class="relative flex items-center justify-center w-8 h-8 rounded border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayTrack();
              }}
              class="text-cyan-400 text-xs hover:text-white transition-colors"
            >
              {isTrackPlaying() ? '⏸' : '▶'}
            </button>
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

      {/* Context Column - Hidden on smaller screens */}
      <td class="retro-grid-cell hidden lg:table-cell">
        <Show when={!(isProfileMode() && isPersonalTrack(props.track))} fallback={
          isPersonalTrack(props.track) && props.track.userInteraction.context ? (
            <ExpandableText 
              text={props.track.userInteraction.context}
              maxLength={80}
              className="text-sm text-white/60 font-mono"
              expandedClassName="text-sm text-white/80 font-mono"
            />
          ) : (
            <span class="text-gray-500 italic">No comment</span>
          )
        }>
          <ExpandableText 
            text={props.track.comment || 'No comment'}
            maxLength={80}
            className="text-sm text-white/60 font-mono"
            expandedClassName="text-sm text-white/80 font-mono"
          />
        </Show>
      </td>

      {/* Likes Column */}
      <td class="retro-grid-cell">
        <button
          ref={likeButtonRef}
          onClick={handleLikeClick}
          class={`flex items-center gap-1 text-sm font-mono hover:bg-red-500/10 px-2 py-1 rounded transition-colors cursor-pointer w-full justify-center ${
            isLiked() ? 'bg-red-500/20' : ''
          }`}
        >
          <span class={isLiked() ? 'text-red-300' : 'text-red-400'}>{isLiked() ? '❤️' : '❤'}</span>
          <span class={isLiked() ? 'text-red-300' : 'text-red-400'}>{likeCount()}</span>
        </button>
      </td>

      {/* Replies Column */}
      <td class="retro-grid-cell">
        <button
          ref={chatButtonRef}
          onClick={handleChatClick}
          class="flex items-center gap-1 text-sm font-mono hover:bg-[#04caf4]/10 px-2 py-1 rounded transition-colors cursor-pointer w-full justify-center"
        >
          <span class="text-blue-400">💬</span>
          <span class="text-blue-400">{replyCount()}</span>
        </button>
      </td>

      {/* Shared By Column (Library) OR Activity Column (Profile) */}
      <Show when={!isProfileMode()} fallback={
        isPersonalTrack(props.track) ? (
          <td class="retro-grid-cell">
            <div class={`flex items-center gap-2 px-2 py-1 rounded border text-xs font-semibold ${getInteractionColor(props.track.userInteraction.type)}`}>
              <span class="text-sm">{getInteractionIcon(props.track.userInteraction.type)}</span>
              <span>{getInteractionLabel(props.track.userInteraction.type)}</span>
            </div>
          </td>
        ) : null
      }>
        <td class="retro-grid-cell">
          <div class="flex items-center gap-2">
            <span class="retro-user-name">
              {props.track.addedBy}
            </span>
          </div>
        </td>
      </Show>

      {/* When Column */}
      <td class="retro-grid-cell">
        <span class="retro-timestamp">
          {(() => {
            if (isProfileMode() && isPersonalTrack(props.track)) {
              return formatTimeAgo(props.track.userInteraction.timestamp);
            }
            return formatTimeAgo(props.track.timestamp);
          })()}
        </span>
      </td>

      {/* Platform Column */}
      <td class="retro-grid-cell">
        <div class={`retro-platform-badge ${props.track.source}`}>
          <span>{getPlatformIcon(props.track.source)}</span>
          <span class="capitalize">{props.track.source}</span>
        </div>
      </td>

      {/* Genre Column - Hidden on smaller screens */}
      <td class="retro-grid-cell hidden xl:table-cell">
        <Show 
          when={props.track.tags && props.track.tags.length > 0}
          fallback={<span class="text-gray-500 italic text-sm">No tags</span>}
        >
          <div class="flex flex-wrap gap-1">
            <For each={props.track.tags?.slice(0, 3)}>
              {(tag, index) => (
                <span 
                  class="bg-[#04caf4]/20 border border-[#04caf4]/40 text-[#04caf4] text-xs px-2 py-1 rounded font-mono hover:bg-[#04caf4]/30 transition-colors cursor-pointer"
                  style={{
                    'animation-delay': `${index() * 100}ms`
                  }}
                >
                  {tag}
                </span>
              )}
            </For>
            <Show when={props.track.tags && props.track.tags.length > 3}>
              <span class="text-[#04caf4]/60 text-xs font-mono">
                +{(props.track.tags?.length || 0) - 3}
              </span>
            </Show>
          </div>
        </Show>
      </td>
    </tr>
    
    </>
  );
};

export default LibraryTableRow;