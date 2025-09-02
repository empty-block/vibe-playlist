import { Component, For, Show, onMount } from 'solid-js';
import { staggeredFadeIn, buttonHover } from '../../../utils/animations';
import type { Artist } from '../HomePage';

interface FavoriteArtistsSectionProps {
  artists: Artist[];
  loading: boolean;
}

export const FavoriteArtistsSection: Component<FavoriteArtistsSectionProps> = (props) => {
  let sectionRef!: HTMLDivElement;
  let artistsGridRef!: HTMLDivElement;

  onMount(() => {
    if (artistsGridRef && !props.loading) {
      const artistItems = artistsGridRef.querySelectorAll('.artist-card');
      staggeredFadeIn(artistItems);
    }
  });

  const handleArtistClick = (artist: Artist) => {
    console.log('Viewing artist:', artist.name);
    // TODO: Navigate to artist view or filter
  };

  return (
    <div ref={sectionRef} class="favorite-artists-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="title-bracket">[</span>
          ARTISTS
          <span class="title-bracket">]</span>
        </h3>
        <div class="section-subtitle">Your musical influences</div>
      </div>

      <Show 
        when={!props.loading && props.artists.length > 0}
        fallback={
          <div class="loading-grid">
            <For each={Array(3).fill(0)}>
              {() => (
                <div class="artist-skeleton">
                  <div class="skeleton-image"></div>
                  <div class="skeleton-name"></div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div ref={artistsGridRef} class="artists-grid">
          <For each={props.artists}>
            {(artist) => (
              <div 
                class="artist-card"
                onClick={() => handleArtistClick(artist)}
              >
                <div class="artist-image">
                  <img src={artist.image} alt={`${artist.name} photo`} />
                  <div class="image-overlay">
                    <div class="overlay-icon">♪</div>
                  </div>
                  {artist.recentActivity && (
                    <div class="activity-pulse">
                      <div class="pulse-ring"></div>
                      <div class="pulse-dot"></div>
                    </div>
                  )}
                </div>
                
                <div class="artist-info">
                  <div class="artist-name">{artist.name}</div>
                  {artist.recentActivity && (
                    <div class="activity-status">Recently active</div>
                  )}
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <div class="section-footer">
        <button class="discover-button">
          <span class="terminal-prompt">&gt;</span>
          <span>DISCOVER_SIMILAR</span>
        </button>
      </div>
    </div>
  );
};