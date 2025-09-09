import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { paginatedTracks, loadAllTracks, isLoading, filteredTracks, totalPages, currentPage, setCurrentPage } from '../../stores/libraryStore';
import { Track } from '../../stores/playlistStore';
import LibraryTableHeader from './LibraryTableHeader';
import LibraryTableRow from './LibraryTableRow';
import LibraryTableFilters from './LibraryTableFilters';
// PersonalLibraryTableFilters removed - create inline component
import TableLoadingSkeleton from './shared/TableLoadingSkeleton';
import TableEmptyState from './shared/TableEmptyState';
import TableErrorState from './shared/TableErrorState';
import TablePagination from './shared/TablePagination';
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
  let tableRef: HTMLTableElement | undefined;
  const [loadingError, setLoadingError] = createSignal<string>('');
  const [personalCurrentPage, setPersonalCurrentPage] = createSignal(1);
  const ITEMS_PER_PAGE = 50;

  const isProfileMode = () => props.mode === 'profile';

  // Profile mode data handling
  const personalFilteredTracks = () => {
    if (!isProfileMode()) return [];
    const allTracks = props.personalTracks || [];
    const filter = props.personalFilter || 'all';
    
    switch (filter) {
      case 'shared':
        return allTracks.filter(track => track.userInteraction.type === 'shared');
      case 'liked':
        return allTracks.filter(track => track.userInteraction.type === 'liked');
      case 'conversations':
        return allTracks.filter(track => track.userInteraction.type === 'conversation');
      case 'recasts':
        return allTracks.filter(track => track.userInteraction.type === 'recast');
      default:
        return allTracks;
    }
  };

  const personalPaginatedTracks = () => {
    const tracks = personalFilteredTracks();
    const start = (personalCurrentPage() - 1) * ITEMS_PER_PAGE;
    return tracks.slice(start, start + ITEMS_PER_PAGE);
  };

  const personalTotalPages = () => {
    return Math.ceil(personalFilteredTracks().length / ITEMS_PER_PAGE);
  };

  onMount(async () => {
    // Only load library tracks if in library mode
    if (!isProfileMode()) {
      try {
        await loadAllTracks();
      } catch (error) {
        setLoadingError('Failed to load music library. Please try again.');
        console.error('Error loading tracks:', error);
      }
    }
  });

  const handlePageChange = (page: number) => {
    if (isProfileMode()) {
      setPersonalCurrentPage(page);
    } else {
      setCurrentPage(page);
    }
    // Scroll to top of table
    if (tableRef) {
      tableRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRetry = () => {
    setLoadingError('');
    if (!isProfileMode()) {
      loadAllTracks();
    }
  };

  // Profile mode filter handling
  const handlePersonalFilterChange = (filter: PersonalFilterType) => {
    setPersonalCurrentPage(1);
    props.onPersonalFilterChange?.(filter);
  };

  const getEmptyStateProps = () => {
    if (!isProfileMode()) {
      return {
        icon: '🎵',
        title: 'No tracks found',
        subtitle: 'Try adjusting your filters or check back later'
      };
    }

    const filter = props.personalFilter || 'all';
    const emptyMessages = {
      shared: { icon: '🎵', title: 'No tracks shared yet', subtitle: 'Start building your musical identity - share your first track!' },
      liked: { icon: '💖', title: 'No liked tracks', subtitle: 'Heart tracks that resonate with you' },
      conversations: { icon: '💬', title: 'No conversations yet', subtitle: 'Join discussions about music you love' },
      recasts: { icon: '🔄', title: 'No recasts yet', subtitle: 'Share tracks from other curators you discover' },
      all: { icon: '🎵', title: 'No musical activity yet', subtitle: 'Start your journey by sharing, liking, or discussing music' }
    };
    
    const message = emptyMessages[filter];
    return {
      ...message,
      actionButton: props.onAddMusic ? {
        label: '+ Add Your First Track',
        onClick: props.onAddMusic
      } : undefined
    };
  };

  const getCurrentPaginated = () => isProfileMode() ? personalPaginatedTracks() : paginatedTracks();
  const getCurrentTotalPages = () => isProfileMode() ? personalTotalPages() : totalPages();
  const getCurrentPage = () => isProfileMode() ? personalCurrentPage() : currentPage();
  const getCurrentFiltered = () => isProfileMode() ? personalFilteredTracks() : filteredTracks();
  const getCurrentLoading = () => isProfileMode() ? props.personalLoading : isLoading();
  const columnCount = isProfileMode() ? 8 : 10;

  return (
    <div class={`retro-music-terminal ${isProfileMode() ? 'personal-library' : ''} relative`}>
      {/* Always use LibraryTableFilters - add Activity filter for profile mode */}
      <LibraryTableFilters 
        profileMode={isProfileMode()}
        personalFilter={props.personalFilter}
        onPersonalFilterChange={handlePersonalFilterChange}
        personalTracks={props.personalTracks}
      />

      {/* Library Data Grid */}
      <div class="overflow-x-auto relative z-20">
        <table ref={tableRef!} class={`retro-data-grid ${isProfileMode() ? 'personal-data-grid' : ''}`}>
          <LibraryTableHeader mode={props.mode} />
          
          <Show 
            when={!getCurrentLoading() && !loadingError()} 
            fallback={
              <Show when={loadingError()} 
                fallback={<TableLoadingSkeleton columnCount={columnCount} />}>
                <TableErrorState 
                  columnSpan={columnCount} 
                  errorMessage={loadingError()} 
                  onRetry={handleRetry} 
                />
              </Show>
            }
          >
            <Show when={getCurrentPaginated().length > 0} 
              fallback={
                <TableEmptyState
                  columnSpan={columnCount}
                  {...getEmptyStateProps()}
                />
              }>
              <tbody>
                <For each={getCurrentPaginated()}>
                  {(track, index) => (
                    <LibraryTableRow 
                      track={track} 
                      trackNumber={((getCurrentPage() - 1) * ITEMS_PER_PAGE) + index() + 1}
                      mode={props.mode}
                    />
                  )}
                </For>
              </tbody>
            </Show>
          </Show>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination 
        currentPage={getCurrentPage()}
        totalPages={getCurrentTotalPages()}
        totalItems={getCurrentFiltered().length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default LibraryTable;