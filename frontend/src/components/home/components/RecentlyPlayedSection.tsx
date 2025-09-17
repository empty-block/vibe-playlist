import { Component, For, Show, onMount } from 'solid-js';
import { buttonHover, shimmer, staggeredFadeIn } from '../../../utils/animations';
import type { Track } from '../HomePage';

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

  const handlePlayTrack = (track: Track) => {
    console.log('Playing track:', track.title);
    // TODO: Integrate with player
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
            {(track) => (
              <div 
                class={`track-item ${track.isNew ? 'new-track' : ''}`}
                onClick={() => handlePlayTrack(track)}
              >
                <div class="track-thumbnail">
                  <img src={track.thumbnail} alt={`${track.title} thumbnail`} />
                  <div class="play-overlay">
                    <div class="play-icon">▶</div>
                  </div>
                  {track.isNew && <div class="new-badge">NEW</div>}
                </div>
                
                <div class="track-info">
                  <div class="track-title">{track.title}</div>
                  <div class="track-artist">{track.artist}</div>
                  <div class="track-source">{track.source}</div>
                </div>
              </div>
            )}
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