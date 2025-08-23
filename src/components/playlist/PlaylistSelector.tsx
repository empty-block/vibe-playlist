import { Component, For } from 'solid-js';
import PlaylistSearchFilter, { PlaylistSortOption, PlaylistFilter } from './PlaylistSearchFilter';
import AnimatedButton from '../common/AnimatedButton';

export interface PlaylistDestination {
  id: string;
  name: string;
  type: 'personal' | 'collaborative' | 'ai_curated';
  icon: string;
  description: string;
  memberCount?: number;
  isDefault?: boolean;
}

interface PlaylistSelectorProps {
  allPlaylists: PlaylistDestination[];
  filteredPlaylists: PlaylistDestination[];
  selectedPlaylists: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: PlaylistFilter;
  onFilterChange: (value: PlaylistFilter) => void;
  sortValue: PlaylistSortOption;
  onSortChange: (value: PlaylistSortOption) => void;
  onClearFilters: () => void;
}

const PlaylistSelector: Component<PlaylistSelectorProps> = (props) => {
  const getPlaylistTypeLabel = (type: PlaylistDestination['type']) => {
    switch (type) {
      case 'personal': return '👤 Personal';
      case 'collaborative': return '👥 Collaborative';
      case 'ai_curated': return '🤖 AI Curated';
    }
  };

  const handleTogglePlaylist = (playlistId: string) => {
    const currentSelection = props.selectedPlaylists;
    if (currentSelection.includes(playlistId)) {
      props.onSelectionChange(currentSelection.filter(id => id !== playlistId));
    } else {
      props.onSelectionChange([...currentSelection, playlistId]);
    }
  };

  const handleSelectAll = () => {
    if (props.selectedPlaylists.length === props.filteredPlaylists.length) {
      props.onSelectionChange([]);
    } else {
      props.onSelectionChange(props.filteredPlaylists.map(p => p.id));
    }
  };

  return (
    <div class="win95-panel mb-6 p-4">
      <h2 class="text-xl font-bold text-black mb-4 flex items-center gap-2">
        <i class="fas fa-list"></i>
        Where to add it?
      </h2>

      {/* Search and Filter Controls */}
      <PlaylistSearchFilter
        searchValue={props.searchValue}
        onSearchChange={props.onSearchChange}
        filterValue={props.filterValue}
        onFilterChange={props.onFilterChange}
        sortValue={props.sortValue}
        onSortChange={props.onSortChange}
        onClearFilters={props.onClearFilters}
        totalCount={props.allPlaylists.length}
        filteredCount={props.filteredPlaylists.length}
        showClearButton={true}
      />

      {/* Selection Controls */}
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-bold text-black">
          Select playlists ({props.selectedPlaylists.length} selected)
        </span>
        <AnimatedButton
          onClick={handleSelectAll}
          class="win95-button px-2 py-1 text-xs"
          animationType="default"
        >
          {props.selectedPlaylists.length === props.filteredPlaylists.length ? 'Deselect All' : 'Select All'}
        </AnimatedButton>
      </div>

      {/* Playlist List */}
      <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {props.filteredPlaylists.length === 0 ? (
          <div class="text-center py-4 text-gray-500">
            <i class="fas fa-search text-2xl mb-2"></i>
            <p>No playlists found matching your criteria</p>
          </div>
        ) : (
          <For each={props.filteredPlaylists}>
            {(playlist) => (
              <label class="flex items-center gap-3 p-3 win95-panel hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={playlist.id}
                  checked={props.selectedPlaylists.includes(playlist.id)}
                  onChange={() => handleTogglePlaylist(playlist.id)}
                  class="text-blue-600"
                />
                <div class="flex items-center gap-3 flex-1">
                  <span class="text-2xl">{playlist.icon}</span>
                  <div class="flex-1">
                    <div class="font-bold text-black flex items-center gap-2">
                      {playlist.name}
                      {playlist.isDefault && (
                        <span class="text-xs bg-blue-600 text-white px-1 rounded">DEFAULT</span>
                      )}
                    </div>
                    <div class="text-sm text-gray-600 flex items-center gap-2">
                      <span>{getPlaylistTypeLabel(playlist.type)}</span>
                      {playlist.memberCount && (
                        <span>• {playlist.memberCount} members</span>
                      )}
                    </div>
                    <div class="text-sm text-gray-500">{playlist.description}</div>
                  </div>
                </div>
              </label>
            )}
          </For>
        )}
      </div>
    </div>
  );
};

export default PlaylistSelector;