import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { paginatedTracks, loadAllTracks, isLoading, filteredTracks, totalPages, currentPage, setCurrentPage } from '../../stores/libraryStore';
import LibraryTableHeader from './LibraryTableHeader';
import LibraryTableRow from './LibraryTableRow';
import LibraryTableFilters from './LibraryTableFilters';
import TableLoadingSkeleton from './shared/TableLoadingSkeleton';
import TableEmptyState from './shared/TableEmptyState';
import TableErrorState from './shared/TableErrorState';
import TablePagination from './shared/TablePagination';
import './retro-table.css';

const LibraryTable: Component = () => {
  let tableRef: HTMLTableElement | undefined;
  const [loadingError, setLoadingError] = createSignal<string>('');

  onMount(async () => {
    try {
      await loadAllTracks();
    } catch (error) {
      setLoadingError('Failed to load music library. Please try again.');
      console.error('Error loading tracks:', error);
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    if (tableRef) {
      tableRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRetry = () => {
    setLoadingError('');
    loadAllTracks();
  };

  return (
    <div class="retro-music-terminal relative">
      {/* Filters with integrated track count */}
      <LibraryTableFilters />

      {/* Library Data Grid */}
      <div class="overflow-x-auto relative z-20">
        <table ref={tableRef!} class="retro-data-grid">
          <LibraryTableHeader />
          
          <Show 
            when={!isLoading() && !loadingError()} 
            fallback={
              <Show when={loadingError()} 
                fallback={<TableLoadingSkeleton columnCount={10} />}>
                <TableErrorState 
                  columnSpan={10} 
                  errorMessage={loadingError()} 
                  onRetry={handleRetry} 
                />
              </Show>
            }
          >
            <Show when={paginatedTracks().length > 0} 
              fallback={
                <TableEmptyState
                  columnSpan={10}
                  icon="🎵"
                  title="No tracks found"
                  subtitle="Try adjusting your filters or check back later"
                />
              }>
              <tbody>
                <For each={paginatedTracks()}>
                  {(track, index) => (
                    <LibraryTableRow 
                      track={track} 
                      trackNumber={((currentPage() - 1) * 50) + index() + 1}
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
        currentPage={currentPage()}
        totalPages={totalPages()}
        totalItems={filteredTracks().length}
        itemsPerPage={50}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default LibraryTable;