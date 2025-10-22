import { Component, For, Show } from 'solid-js';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../../shared/types/channels';
import './FilterDialog.css';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeSort: ChannelFeedSortOption;
  onSortChange: (sort: ChannelFeedSortOption) => void;
  qualityFilter: number;
  onQualityFilterChange: (minLikes: number) => void;
  musicSources: MusicPlatform[];
  onMusicSourcesChange: (sources: MusicPlatform[]) => void;
  genres: string[];
  onGenresChange: (genres: string[]) => void;
  availablePlatforms: MusicPlatform[];
  availableGenres: string[];
}

const SORT_OPTIONS: Array<{
  value: ChannelFeedSortOption;
  label: string;
}> = [
  { value: 'recent', label: 'Recent' },
  { value: 'popular_24h', label: 'Popular (24h)' },
  { value: 'popular_7d', label: 'Popular (7d)' },
  { value: 'all_time', label: 'All Time' },
];

const QUALITY_OPTIONS = [
  { value: 0, label: 'All Posts' },
  { value: 3, label: '3+ Likes' },
];

const PLATFORM_LABELS: Record<MusicPlatform, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  apple_music: 'Apple Music',
  soundcloud: 'SoundCloud',
  songlink: 'Songlink',
  audius: 'Audius',
  bandcamp: 'Bandcamp',
};

export const FilterDialog: Component<FilterDialogProps> = (props) => {
  const handleSourceToggle = (platform: MusicPlatform) => {
    const current = props.musicSources;
    if (current.includes(platform)) {
      props.onMusicSourcesChange(current.filter((p) => p !== platform));
    } else {
      props.onMusicSourcesChange([...current, platform]);
    }
  };

  const handleGenreToggle = (genre: string) => {
    const current = props.genres;
    if (current.includes(genre)) {
      props.onGenresChange(current.filter((g) => g !== genre));
    } else {
      props.onGenresChange([...current, genre]);
    }
  };

  const handleClearAll = () => {
    props.onSortChange('recent');
    props.onQualityFilterChange(0);
    props.onMusicSourcesChange([]);
    props.onGenresChange([]);
  };

  const hasActiveFilters = () => {
    return (
      props.activeSort !== 'recent' ||
      props.qualityFilter > 0 ||
      props.musicSources.length > 0 ||
      props.genres.length > 0
    );
  };

  // Close on backdrop click
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="filter-dialog-backdrop" onClick={handleBackdropClick}>
        <div class="filter-dialog-window">
          {/* Title Bar */}
          <div class="filter-dialog-titlebar">
            <span class="filter-dialog-title">Filter Options</span>
            <button class="filter-dialog-close-btn" onClick={props.onClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div class="filter-dialog-content">
            {/* Sort By Section */}
            <div class="filter-section">
              <div class="filter-section-header">Sort By</div>
              <div class="filter-section-options">
                <For each={SORT_OPTIONS}>
                  {(option) => (
                    <label class="filter-radio-option">
                      <input
                        type="radio"
                        name="sort"
                        checked={props.activeSort === option.value}
                        onChange={() => props.onSortChange(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>

            {/* Quality Section */}
            <div class="filter-section">
              <div class="filter-section-header">Quality Filter</div>
              <div class="filter-section-options">
                <For each={QUALITY_OPTIONS}>
                  {(option) => (
                    <label class="filter-radio-option">
                      <input
                        type="radio"
                        name="quality"
                        checked={props.qualityFilter === option.value}
                        onChange={() => props.onQualityFilterChange(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>

            {/* Music Sources Section */}
            <div class="filter-section">
              <div class="filter-section-header">Music Sources</div>
              <div class="filter-section-options filter-section-options--checkboxes">
                <For each={props.availablePlatforms}>
                  {(platform) => (
                    <label class="filter-checkbox-option">
                      <input
                        type="checkbox"
                        checked={props.musicSources.includes(platform)}
                        onChange={() => handleSourceToggle(platform)}
                      />
                      <span>{PLATFORM_LABELS[platform]}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>

            {/* Genres Section */}
            <div class="filter-section">
              <div class="filter-section-header">Genres</div>
              <div class="filter-section-options filter-section-options--checkboxes">
                <For each={props.availableGenres}>
                  {(genre) => (
                    <label class="filter-checkbox-option">
                      <input
                        type="checkbox"
                        checked={props.genres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                      />
                      <span>{genre}</span>
                    </label>
                  )}
                </For>
              </div>
            </div>
          </div>

          {/* Footer with Clear All */}
          <div class="filter-dialog-footer">
            <Show when={hasActiveFilters()}>
              <button class="filter-clear-all-btn" onClick={handleClearAll}>
                Clear All Filters
              </button>
            </Show>
            <button class="filter-apply-btn" onClick={props.onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
