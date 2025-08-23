import { Component } from 'solid-js';
import TextInput from '../common/TextInput';
import AnimatedButton from '../common/AnimatedButton';

export type PlaylistSortOption = 'recent' | 'popular' | 'alphabetical';
export type PlaylistFilter = 'all' | 'personal' | 'collaborative' | 'ai_curated';

interface PlaylistSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: PlaylistFilter;
  onFilterChange: (value: PlaylistFilter) => void;
  sortValue: PlaylistSortOption;
  onSortChange: (value: PlaylistSortOption) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
  showClearButton?: boolean;
}

const PlaylistSearchFilter: Component<PlaylistSearchFilterProps> = (props) => {
  const hasActiveFilters = () => {
    return props.searchValue || props.filterValue !== 'all' || props.sortValue !== 'recent';
  };

  return (
    <div class="mb-4 p-3 win95-panel">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-gray-600">
          {props.filteredCount} of {props.totalCount} playlists
        </div>
        {(props.showClearButton && hasActiveFilters()) && (
          <AnimatedButton
            onClick={props.onClearFilters}
            class="win95-button px-2 py-1 text-xs whitespace-nowrap"
            animationType="default"
          >
            <i class="fas fa-times mr-1"></i>
            <span class="hidden sm:inline">Clear Filters</span>
            <span class="sm:hidden">Clear</span>
          </AnimatedButton>
        )}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div>
          <TextInput
            label="Search playlists"
            value={props.searchValue}
            onInput={props.onSearchChange}
            placeholder="Find playlists..."
          />
        </div>
        
        {/* Filter */}
        <div>
          <label class="block text-xs font-bold text-black mb-1">Filter by type</label>
          <select
            value={props.filterValue}
            onChange={(e) => props.onFilterChange(e.currentTarget.value as PlaylistFilter)}
            class="win95-panel w-full px-2 py-1 text-sm font-bold text-black"
          >
            <option value="all">🎵 All Types</option>
            <option value="personal">👤 Personal</option>
            <option value="collaborative">👥 Collaborative</option>
            <option value="ai_curated">🤖 AI Curated</option>
          </select>
        </div>
        
        {/* Sort */}
        <div>
          <label class="block text-xs font-bold text-black mb-1">Sort by</label>
          <select
            value={props.sortValue}
            onChange={(e) => props.onSortChange(e.currentTarget.value as PlaylistSortOption)}
            class="win95-panel w-full px-2 py-1 text-sm font-bold text-black"
          >
            <option value="recent">📅 Recent</option>
            <option value="popular">🔥 Popular</option>
            <option value="alphabetical">🔤 A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSearchFilter;