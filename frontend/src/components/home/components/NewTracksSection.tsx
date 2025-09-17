import { Component, For, Show } from 'solid-js';
import type { Track } from '../HomePage';

interface NewTracksSectionProps {
  tracks: Track[];
  loading: boolean;
}

export const NewTracksSection: Component<NewTracksSectionProps> = (props) => {
  const newTracks = () => props.tracks.filter(track => track.isNew);

  const handleTrackClick = (track: Track) => {
    console.log('Playing track:', track.title);
    // TODO: Implement play functionality
  };

  const handleKeyPress = (e: KeyboardEvent, track: Track) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTrackClick(track);
    }
  };

  return (
    <section class="new-tracks-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="terminal-prompt">[NEW_TRACKS]$</span>
          Latest Discoveries
        </h2>
        <Show when={newTracks().length > 0}>
          <span class="track-count">{newTracks().length} new</span>
        </Show>
      </div>

      <Show
        when={!props.loading && newTracks().length > 0}
        fallback={
          <Show when={props.loading}>
            <div class="new-tracks-grid">
              <For each={[1, 2, 3, 4]}>
                {() => (
                  <div class="new-track-card skeleton">
                    <div class="track-thumbnail-skeleton"></div>
                    <div class="track-info-skeleton">
                      <div class="title-skeleton"></div>
                      <div class="artist-skeleton"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        }
      >
        <div class="new-tracks-grid">
          <For each={newTracks()}>
            {(track) => (
              <div
                class="new-track-card"
                role="button"
                tabIndex={0}
                aria-label={`New track: ${track.title} by ${track.artist}, discovered from network`}
                onClick={() => handleTrackClick(track)}
                onKeyDown={(e) => handleKeyPress(e, track)}
              >
                <div class="new-badge">NEW</div>
                
                <div class="track-thumbnail">
                  <img
                    src={track.thumbnail}
                    alt={`${track.title} album cover`}
                    loading="lazy"
                  />
                  <div class="play-overlay">
                    <div class="play-icon">▶</div>
                  </div>
                </div>

                <div class="track-info">
                  <h3 class="track-title">{track.title}</h3>
                  <p class="track-artist">{track.artist}</p>
                  <div class="track-meta">
                    <span class="track-source">{track.source}</span>
                    <span class="discovery-source">from network</span>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={!props.loading && newTracks().length === 0}>
        <div class="empty-state">
          <div class="empty-icon">🎵</div>
          <p class="empty-text">No new tracks discovered yet</p>
          <p class="empty-subtext">Connect to more networks to discover music</p>
        </div>
      </Show>
    </section>
  );
};