import { Component, Show } from 'solid-js';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../../shared/types/channels';
import { FilterDialog } from './FilterDialog';
import './ChannelFilterBar.css';

interface ChannelFilterBarProps {
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
  filterDialogOpen: boolean;
  onFilterDialogOpenChange: (open: boolean) => void;
}

export const ChannelFilterBar: Component<ChannelFilterBarProps> = (props) => {

  // Calculate number of active filters
  const activeFilterCount = () => {
    let count = 0;
    // Don't count shuffle - it has its own button
    if (props.activeSort !== 'recent' && props.activeSort !== 'shuffle') count++;
    if (props.qualityFilter > 0) count++;
    if (props.musicSources.length > 0) count++;
    if (props.genres.length > 0) count++;
    return count;
  };

  return (
    <div class="channel-filter-bar-container">
      {/* Shuffle Button */}
      <button
        class={`shuffle-btn ${
          props.activeSort === 'shuffle' ? 'shuffle-btn--active' : ''
        }`}
        onClick={() => {
          console.log('[ChannelFilterBar] Shuffle clicked');
          props.onSortChange('shuffle');
        }}
      >
        🔀 Shuffle
      </button>

      {/* Filter Button with Badge */}
      <button
        class={`filter-toggle-btn ${
          activeFilterCount() > 0 ? 'filter-toggle-btn--active' : ''
        }`}
        onClick={() => props.onFilterDialogOpenChange(true)}
      >
        Filter
        <Show when={activeFilterCount() > 0}>
          <span class="filter-badge">{activeFilterCount()}</span>
        </Show>
      </button>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={props.filterDialogOpen}
        onClose={() => props.onFilterDialogOpenChange(false)}
        activeSort={props.activeSort}
        onSortChange={props.onSortChange}
        qualityFilter={props.qualityFilter}
        onQualityFilterChange={props.onQualityFilterChange}
        musicSources={props.musicSources}
        onMusicSourcesChange={props.onMusicSourcesChange}
        genres={props.genres}
        onGenresChange={props.onGenresChange}
        availablePlatforms={props.availablePlatforms}
        availableGenres={props.availableGenres}
      />
    </div>
  );
};
