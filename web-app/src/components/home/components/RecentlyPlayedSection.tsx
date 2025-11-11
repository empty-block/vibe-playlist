import { Component, For, Show, onMount } from 'solid-js';
import { buttonHover, shimmer, staggeredFadeIn } from '../../../utils/animations';
import type { Track } from '../HomePage';
import { CompactTrackCard } from '../../common/TrackCard/NEW';
import { playTrack } from '../../../stores/playerStore';
import type { Track as PlayerTrack } from '../../../stores/playerStore';

interface RecentlyPlayedSectionProps {
  tracks: Track[];
  loading: boolean;
}

export const RecentlyPlayedSection: Component<RecentlyPlayedSectionProps> = (props) => {
  let sectionRef!: HTMLDivElement;
  let tracksGridRef!: HTMLDivElement;

  onMount(() => {
    if (tracksGridRef && !props.loading) {
      const trackItems = tracksGridRef.querySelectorAll('.track-item');
      staggeredFadeIn(trackItems);
    }
  });

  const handlePlayTrack = async (track: Track) => {
    console.log('Playing track:', track.title);
    // Convert HomePage Track to PlayerTrack format
    const playerTrack: PlayerTrack = {
      ...track,
      source: track.source as any,
      sourceId: track.id,
      duration: '0:00',
      thumbnail: track.thumbnail || '',
      addedBy: 'You',
      userAvatar: '',
      timestamp: new Date().toISOString(),
      comment: '',
      likes: 0,
      replies: 0,
      recasts: 0
    };
    await playTrack(playerTrack);
  };

  return (
    <div ref={sectionRef} class="recently-played-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-bracket">[</span>
          RECENTLY_PLAYED
          <span class="title-bracket">]</span>
        </h2>
        <div class="section-subtitle">Your latest musical journey</div>
      </div>

      <Show 
        when={!props.loading && props.tracks.length > 0}
        fallback={
          <div class="loading-grid">
            <For each={Array(4).fill(0)}>
              {() => (
                <div class="track-skeleton">
                  <div class="skeleton-thumbnail"></div>
                  <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-artist"></div>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div ref={tracksGridRef} class="tracks-grid">
          <For each={props.tracks}>
            {(track) => {
              // Convert HomePage Track to PlayerTrack format for CompactTrackCard
              const playerTrack: PlayerTrack = {
                ...track,
                source: track.source as any,
                sourceId: track.id,
                duration: '0:00',
                thumbnail: track.thumbnail || '',
                addedBy: 'You',
                userAvatar: '',
                timestamp: new Date().toISOString(),
                comment: '',
                likes: 0,
                replies: 0,
                recasts: 0
              };

              return (
                <CompactTrackCard
                  track={playerTrack}
                  onPlay={handlePlayTrack}
                />
              );
            }}
          </For>
        </div>
      </Show>

      <div class="section-footer">
        <button class="view-all-button">
          <span class="terminal-prompt">&gt;</span>
          <span>VIEW_ALL_HISTORY</span>
        </button>
      </div>
    </div>
  );
};