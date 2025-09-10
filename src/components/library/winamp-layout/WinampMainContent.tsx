import { Component, Show } from 'solid-js';
import { PersonalTrack, PersonalFilterType } from '../LibraryTable';
import LibraryTableFilters from '../LibraryTableFilters';
import LibraryTableHeader from '../LibraryTableHeader';
import LibraryTableRow from '../LibraryTableRow';
import TableLoadingSkeleton from '../shared/TableLoadingSkeleton';
import TableEmptyState from '../shared/TableEmptyState';
import TableErrorState from '../shared/TableErrorState';
import TablePagination from '../shared/TablePagination';
import MobileSidebarToggle from './MobileSidebarToggle';
import { paginatedTracks, isLoading, filteredTracks, totalPages, currentPage } from '../../../stores/libraryStore';
import { selectedNetwork } from '../../../stores/networkStore';
import { For, createSignal, onMount } from 'solid-js';

interface WinampMainContentProps {
  mode?: 'library' | 'profile';
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  // Profile mode props
  personalTracks?: PersonalTrack[];
  personalLoading?: boolean;
  personalFilter?: PersonalFilterType;
  onPersonalFilterChange?: (filter: PersonalFilterType) => void;
  onAddMusic?: () => void;
  userId?: string;
}

const WinampMainContent: Component<WinampMainContentProps> = (props) => {
  let tableRef: HTMLTableElement | undefined;
  const [loadingError, setLoadingError] = createSignal<string>('');
  const [personalCurrentPage, setPersonalCurrentPage] = createSignal(1);
  const ITEMS_PER_PAGE = 50;

  const isProfileMode = () => props.mode === 'profile';

  // Profile mode data handling (copied from LibraryTable)
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

  const handlePageChange = (page: number) => {
    if (isProfileMode()) {
      setPersonalCurrentPage(page);
    } else {
      // This will be handled by libraryStore
    }
    // Scroll to top of table
    if (tableRef) {
      tableRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePersonalFilterChange = (filter: PersonalFilterType) => {
    setPersonalCurrentPage(1);
    props.onPersonalFilterChange?.(filter);
  };

  // Helper functions for consistent data access
  const getCurrentPaginated = () => isProfileMode() ? personalPaginatedTracks() : paginatedTracks();
  const getCurrentTotalPages = () => isProfileMode() ? personalTotalPages() : totalPages();
  const getCurrentPage = () => isProfileMode() ? personalCurrentPage() : currentPage();
  const getCurrentFiltered = () => isProfileMode() ? personalFilteredTracks() : filteredTracks();
  const getCurrentLoading = () => isProfileMode() ? props.personalLoading : isLoading();
  const columnCount = isProfileMode() ? 7 : 9; // Images simplified to play buttons

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

  const handleRetry = () => {
    setLoadingError('');
    // This will be handled by the library store load function
  };

  return (
    <div class="winamp-main-content">
      {/* Mobile Header with Sidebar Toggle */}
      <div class="main-content-header">
        <MobileSidebarToggle 
          onToggle={props.onSidebarToggle}
          isOpen={props.isSidebarOpen}
        />
        <h1 class="content-title">LIBRARY_DATA</h1>
      </div>

      {/* Search and Filters */}
      <div class="search-filters-wrapper">
        <LibraryTableFilters 
          profileMode={isProfileMode()}
          personalFilter={props.personalFilter}
          onPersonalFilterChange={handlePersonalFilterChange}
          personalTracks={props.personalTracks}
        />
      </div>

      {/* Track Table */}
      <div class="table-wrapper">
        {/* Mobile Card Layout (320-767px) */}
        <div class="mobile-cards">
          <Show 
            when={!getCurrentLoading() && !loadingError()} 
            fallback={
              <Show when={loadingError()} 
                fallback={
                  <div class="mobile-loading">
                    <For each={Array(5).fill(0)}>
                      {() => (
                        <div class="loading-card">
                          <div class="loading-content">
                            <div class="loading-header">
                              <div class="loading-title"></div>
                              <div class="loading-subtitle"></div>
                            </div>
                            <div class="loading-details">
                              <div class="loading-detail"></div>
                              <div class="loading-detail"></div>
                              <div class="loading-detail"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                }>
                <div class="error-card">
                  <div class="error-icon">⚠</div>
                  <h3 class="error-title">Error Loading Library</h3>
                  <p class="error-message">{loadingError()}</p>
                  <button onClick={handleRetry} class="error-retry-btn">
                    Retry
                  </button>
                </div>
              </Show>
            }
          >
            <Show when={getCurrentPaginated().length > 0} 
              fallback={
                <div class="empty-card">
                  <div class="empty-icon">🎵</div>
                  <h3 class="empty-title">No tracks found</h3>
                  <p class="empty-subtitle">Try adjusting your filters or check back later</p>
                </div>
              }>
              <div class="track-cards">
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
        <div class="desktop-table">
          <table ref={tableRef!} class="winamp-data-grid">
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
      <div class="pagination-wrapper">
        <TablePagination 
          currentPage={getCurrentPage()}
          totalPages={getCurrentTotalPages()}
          totalItems={getCurrentFiltered().length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

    </div>
  );
};

export default WinampMainContent;