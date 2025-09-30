import { Component, For, Show, createMemo } from 'solid-js';
import { GenreData } from './utils/browseDataExtractors';

interface GenreBrowseSectionProps {
  genres: GenreData[];
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
  isLoading?: boolean;
}

const GenreBrowseSection: Component<GenreBrowseSectionProps> = (props) => {
  // Prepend "All Genres" option
  const genresWithAll = createMemo(() => [
    { name: 'All Genres', count: props.genres.reduce((sum, g) => sum + g.count, 0) },
    ...props.genres
  ]);

  const handleGenreClick = (genreName: string) => {
    if (genreName === 'All Genres') {
      props.onGenreSelect(null);
    } else {
      const newSelection = props.selectedGenre === genreName ? null : genreName;
      props.onGenreSelect(newSelection);
    }
  };

  const isSelected = (genreName: string) => {
    if (genreName === 'All Genres') {
      return props.selectedGenre === null;
    }
    return props.selectedGenre === genreName;
  };

  return (
    <div class="browse-section">
      <div class="browse-section-header">
        GENRES
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
                      <div class="loading-bar" style="width: 60%;"></div>
                      <div class="loading-bar" style="width: 25%;"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <Show 
            when={genresWithAll().length > 0}
            fallback={
              <div class="empty-state">
                <div class="empty-icon">🏷️</div>
                <div class="empty-text">No genres found</div>
              </div>
            }
          >
            <For each={genresWithAll()}>
              {(genre) => (
                <div 
                  class={`browse-item ${isSelected(genre.name) ? 'selected' : ''}`}
                  onClick={() => handleGenreClick(genre.name)}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleGenreClick(genre.name);
                    }
                  }}
                  role="button"
                  aria-pressed={isSelected(genre.name)}
                  title={`${genre.name} - ${genre.count} track${genre.count !== 1 ? 's' : ''}`}
                >
                  <div class="browse-item-content">
                    <div class="browse-item-name">
                      {genre.name}
                    </div>
                    <div class="browse-item-count">
                      ({genre.count})
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

export default GenreBrowseSection;