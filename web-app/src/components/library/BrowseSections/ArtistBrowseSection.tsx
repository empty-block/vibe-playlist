import { Component, For, Show, createMemo } from 'solid-js';
import { ArtistData } from './utils/browseDataExtractors';

interface ArtistBrowseSectionProps {
  artists: ArtistData[];
  selectedArtist: string | null;
  onArtistSelect: (artist: string | null) => void;
  isLoading?: boolean;
}

const ArtistBrowseSection: Component<ArtistBrowseSectionProps> = (props) => {
  // Prepend "All Artists" option
  const artistsWithAll = createMemo(() => [
    { name: 'All Artists', count: props.artists.reduce((sum, a) => sum + a.count, 0) },
    ...props.artists
  ]);

  const handleArtistClick = (artistName: string) => {
    if (artistName === 'All Artists') {
      props.onArtistSelect(null);
    } else {
      const newSelection = props.selectedArtist === artistName ? null : artistName;
      props.onArtistSelect(newSelection);
    }
  };

  const isSelected = (artistName: string) => {
    if (artistName === 'All Artists') {
      return props.selectedArtist === null;
    }
    return props.selectedArtist === artistName;
  };

  return (
    <div class="browse-section">
      <div class="browse-section-header">
        ARTISTS
      </div>
      
      <div class="browse-section-content">
        <Show 
          when={!props.isLoading} 
          fallback={
            <div class="loading-state">
              <For each={Array(8).fill(0)}>
                {() => (
                  <div class="browse-item loading">
                    <div class="browse-item-content">
                      <div class="loading-bar" style="width: 70%;"></div>
                      <div class="loading-bar" style="width: 20%;"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <Show 
            when={artistsWithAll().length > 0}
            fallback={
              <div class="empty-state">
                <div class="empty-icon">🎵</div>
                <div class="empty-text">No artists found</div>
              </div>
            }
          >
            <For each={artistsWithAll()}>
              {(artist) => (
                <div 
                  class={`browse-item ${isSelected(artist.name) ? 'selected' : ''}`}
                  onClick={() => handleArtistClick(artist.name)}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleArtistClick(artist.name);
                    }
                  }}
                  role="button"
                  aria-pressed={isSelected(artist.name)}
                  title={`${artist.name} - ${artist.count} track${artist.count !== 1 ? 's' : ''}`}
                >
                  <div class="browse-item-content">
                    <div class="browse-item-name">
                      {artist.name}
                    </div>
                    <div class="browse-item-count">
                      ({artist.count})
                    </div>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default ArtistBrowseSection;