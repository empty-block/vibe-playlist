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

      {/* Responsive Library Data Grid */}
      <div class="overflow-x-auto relative z-20">
        {/* Mobile Card Layout (320-767px) */}
        <div class="block md:hidden">
          <Show 
            when={!getCurrentLoading() && !loadingError()} 
            fallback={
              <Show when={loadingError()} 
                fallback={<div class="space-y-4">
                  <For each={Array(5).fill(0)}>
                    {() => (
                      <div class="bg-[#0d0d0d]/80 border border-[#04caf4]/20 rounded-lg p-4 animate-pulse">
                        <div class="flex items-center gap-3 mb-3">
                          <div class="w-12 h-12 bg-[#04caf4]/20 rounded-lg"></div>
                          <div class="flex-1 space-y-2">
                            <div class="h-4 bg-[#04caf4]/20 rounded w-3/4"></div>
                            <div class="h-3 bg-[#04caf4]/10 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                          <div class="h-3 bg-[#04caf4]/10 rounded"></div>
                          <div class="h-3 bg-[#04caf4]/10 rounded"></div>
                          <div class="h-3 bg-[#04caf4]/10 rounded"></div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>}>
                <div class="bg-[#0d0d0d]/80 border border-red-500/30 rounded-lg p-6 text-center">
                  <div class="text-red-400 text-4xl mb-4">⚠</div>
                  <h3 class="text-red-400 font-bold mb-2">Error Loading Library</h3>
                  <p class="text-white/60 text-sm mb-4">{loadingError()}</p>
                  <button 
                    onClick={handleRetry}
                    class="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-2 rounded font-mono text-sm hover:bg-red-500/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </Show>
            }
          >
            <Show when={getCurrentPaginated().length > 0} 
              fallback={
                <div class="bg-[#0d0d0d]/80 border border-[#04caf4]/20 rounded-lg p-6 text-center">
                  <div class="text-4xl mb-4">🎵</div>
                  <h3 class="text-white font-bold mb-2">No tracks found</h3>
                  <p class="text-white/60 text-sm">Try adjusting your filters or check back later</p>
                </div>
              }>
              <div class="space-y-3">
                <For each={getCurrentPaginated()}>
                  {(track, index) => (
                    <LibraryTableRow 
                      track={track} 
                      trackNumber={((getCurrentPage() - 1) * ITEMS_PER_PAGE) + index() + 1}
                      mode={props.mode}
                      isMobile={true}
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>

        {/* Desktop Table Layout (768px+) */}
        <div class="hidden md:block">
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
                        isMobile={false}
                      />
                    )}
                  </For>
                </tbody>
              </Show>
            </Show>
          </table>
        </div>
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