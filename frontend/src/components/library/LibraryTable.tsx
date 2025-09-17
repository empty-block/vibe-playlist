import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { paginatedTracks, loadAllTracks, isLoading, filteredTracks, totalPages, currentPage, setCurrentPage } from '../../stores/libraryStore';
import { Track } from '../../stores/playerStore';
// LibraryLayout import removed - now used at page level
import './retro-table.css';

// Import PersonalTrack type from PersonalLibraryTable
export interface PersonalTrack extends Track {
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast';
    timestamp: string;
    context?: string;
    socialStats?: {
      likes: number;
      replies: number;
      recasts: number;
    };
  };
}

export type PersonalFilterType = 'all' | 'shared' | 'liked' | 'conversations' | 'recasts';

interface LibraryTableProps {
  mode?: 'library' | 'profile';
  // Profile mode props
  personalTracks?: PersonalTrack[];
  personalLoading?: boolean;
  personalFilter?: PersonalFilterType;
  onPersonalFilterChange?: (filter: PersonalFilterType) => void;
  onAddMusic?: () => void;
  userId?: string;
}

// Removed PersonalFilters - now integrated into LibraryTableFilters

const LibraryTable: Component<LibraryTableProps> = (props) => {
  // Load all tracks on mount for library mode
  onMount(async () => {
    if (props.mode !== 'profile') {
      try {
        await loadAllTracks();
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    }
  });

  // Get tracks based on mode
  const tracks = () => {
    if (props.mode === 'profile' && props.personalTracks) {
      return props.personalTracks;
    }
    return paginatedTracks();
  };

  return (
    <div class="library-table">
      {/* Loading State */}
      <Show when={isLoading() || (props.mode === 'profile' && props.personalLoading)}>
        <div class="table-loading">Loading tracks...</div>
      </Show>

      {/* Empty State */}
      <Show when={!isLoading() && tracks().length === 0}>
        <div class="table-empty">No tracks found</div>
      </Show>

      {/* Table Content */}
      <Show when={!isLoading() && tracks().length > 0}>
        <div class="retro-table">
          {/* Table Header */}
          <div class="table-header">
            <div class="header-cell track">Track</div>
            <div class="header-cell artist">Artist</div>
            <div class="header-cell platform">Platform</div>
            <div class="header-cell duration">Duration</div>
          </div>

          {/* Table Body */}
          <div class="table-body">
            <For each={tracks()}>
              {(track) => (
                <div class="table-row">
                  <div class="cell track">{track.title}</div>
                  <div class="cell artist">{track.artist}</div>
                  <div class="cell platform">{track.source}</div>
                  <div class="cell duration">{track.duration}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default LibraryTable;