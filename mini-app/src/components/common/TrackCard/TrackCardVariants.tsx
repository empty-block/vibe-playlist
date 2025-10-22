import { Component, Show, For } from 'solid-js';
import { Track } from '../../../stores/playerStore';
import { PersonalTrack } from '../../library/LibraryTableRow';
import TrackThumbnail from './TrackThumbnail';
import TrackMetadata from './TrackMetadata';
import TrackSocialActions from './TrackSocialActions';
import PlatformBadge from './PlatformBadge';
import ExpandableText from '../../ui/ExpandableText';

interface VariantProps {
  track: Track | PersonalTrack;
  showSocialActions?: boolean;
  showUserContext?: boolean;
  showExpandableComment?: boolean;
  onPlay?: (track: Track) => void;
  onLike?: (track: Track) => void;
  onReply?: (track: Track) => void;
  formatTimeAgo?: (timestamp: string) => string;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
}

// Compact Layout - for grid views, home page sections (square thumbnails)
export const CompactLayout: Component<VariantProps> = (props) => {
  return (
    <div class="track-card-compact-layout flex flex-col gap-2">
      <TrackThumbnail
        src={props.track.thumbnail}
        alt={`${props.track.title} cover`}
        size="large"
        showPlayButton={true}
        onPlay={() => props.onPlay?.(props.track)}
      >
        <PlatformBadge source={props.track.source} variant="overlay" />
      </TrackThumbnail>

      <div class="track-card-info flex flex-col gap-1">
        <TrackMetadata
          title={props.track.title}
          artist={props.track.artist}
          layout="stacked"
        />

        <Show when={props.showSocialActions}>
          <TrackSocialActions
            track={props.track}
            onLike={props.onLike}
            onReply={props.onReply}
            compact={true}
          />
        </Show>
      </div>
    </div>
  );
};

// Detailed Layout - for feed views with horizontal layout
export const DetailedLayout: Component<VariantProps> = (props) => {
  return (
    <div class="track-card-detailed-layout flex gap-3">
      <TrackThumbnail
        src={props.track.thumbnail}
        alt={`${props.track.title} cover`}
        size="medium"
        showPlayButton={true}
        onPlay={() => props.onPlay?.(props.track)}
      >
        <PlatformBadge source={props.track.source} variant="overlay" />
      </TrackThumbnail>

      <div class="flex-1 min-w-0 flex flex-col gap-1">
        <TrackMetadata
          title={props.track.title}
          artist={props.track.artist}
          layout="stacked"
        />

        <Show when={props.showUserContext}>
          <div class="flex items-center gap-2 text-xs">
            <span class="retro-user-name truncate">
              {props.track.addedBy}
            </span>
            <span class="retro-timestamp">
              {props.formatTimeAgo?.(props.track.timestamp) || props.track.timestamp}
            </span>
          </div>
        </Show>

        <Show when={props.showExpandableComment && props.track.comment}>
          <ExpandableText
            text={props.track.comment}
            maxLength={80}
            className="text-xs text-white/60 font-mono"
            expandedClassName="text-xs text-white/80 font-mono"
          />
        </Show>

        <Show when={props.showSocialActions}>
          <TrackSocialActions
            track={props.track}
            onLike={props.onLike}
            onReply={props.onReply}
            compact={true}
          />
        </Show>
      </div>
    </div>
  );
};

// Grid Layout - for browse sections with hover effects
export const GridLayout: Component<VariantProps> = (props) => {
  return (
    <div class="track-card-grid-layout flex flex-col gap-2">
      <TrackThumbnail
        src={props.track.thumbnail}
        alt={`${props.track.title} cover`}
        size="large"
        showPlayButton={true}
        onPlay={() => props.onPlay?.(props.track)}
      >
        <PlatformBadge source={props.track.source} variant="overlay" />
      </TrackThumbnail>

      <div class="track-card-info">
        <TrackMetadata
          title={props.track.title}
          artist={props.track.artist}
          layout="stacked"
        />

        <Show when={props.showUserContext}>
          <div class="flex items-center justify-between mt-2 text-xs">
            <span class="retro-user-name truncate">
              {props.track.addedBy}
            </span>
            <span class="retro-timestamp">
              {props.formatTimeAgo?.(props.track.timestamp) || props.track.timestamp}
            </span>
          </div>
        </Show>
      </div>
    </div>
  );
};

// List Layout - mobile version of table rows (full-width)
export const ListLayout: Component<VariantProps> = (props) => {
  const isPersonalTrack = (track: Track | PersonalTrack): track is PersonalTrack => {
    return 'userInteraction' in track;
  };

  return (
    <div class="track-card-list-layout">
      {/* Main Track Info */}
      <div class="flex items-center gap-2 mb-2">
        <div class="relative flex items-center justify-center w-10 h-10 rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onPlay?.(props.track);
            }}
            class="text-cyan-400 text-xl hover:text-white transition-colors"
            aria-label={props.isPlaying ? 'Pause' : 'Play'}
          >
            {props.isPlaying ? '⏸' : '▶'}
          </button>
        </div>

        <div class="min-w-0 flex-1">
          <div class="retro-track-title text-sm font-bold mb-1 truncate">
            {props.track.title}
          </div>
          <div class="retro-track-artist text-xs mb-1 truncate">
            {props.track.artist}
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="retro-user-name truncate">
              {props.track.addedBy}
            </span>
          </div>
        </div>

        <div class="text-right">
          <div class="retro-timestamp text-xs mb-1">
            {props.formatTimeAgo?.(props.track.timestamp) || props.track.timestamp}
          </div>
          <div class="mb-1">
            <PlatformBadge source={props.track.source} variant="compact" />
          </div>
          {/* Genre Tags - Mobile */}
          <Show when={props.track.tags && props.track.tags.length > 0}>
            <div class="flex flex-wrap gap-1 justify-end">
              <For each={props.track.tags?.slice(0, 2)}>
                {(tag) => (
                  <span class="bg-[#04caf4]/20 border border-[#04caf4]/40 text-[#04caf4] text-xs px-2 py-0.5 rounded font-mono">
                    {tag}
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>

      {/* Bottom Row: Context and Social Stats */}
      <div class="pt-2 border-t border-[#04caf4]/10">
        <div class="flex items-center justify-between gap-2">
          <div class="flex-1 min-w-0">
            <Show when={props.showExpandableComment && props.track.comment}>
              <ExpandableText
                text={props.track.comment}
                maxLength={60}
                className="text-xs text-white/60 font-mono"
                expandedClassName="text-xs text-white/80 font-mono leading-relaxed"
              />
            </Show>
          </div>
          <Show when={props.showSocialActions}>
            <TrackSocialActions
              track={props.track}
              onLike={props.onLike}
              onReply={props.onReply}
              compact={true}
            />
          </Show>
        </div>
      </div>
    </div>
  );
};