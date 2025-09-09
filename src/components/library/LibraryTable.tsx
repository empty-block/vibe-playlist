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

      {/* Responsive Library Data Grid */}
      <div class="overflow-x-auto relative z-20">
        {/* Mobile Card Layout (320-767px) */}
        <div class="block md:hidden">
          <Show 
            when={!isLoading() && !loadingError()} 
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
            <Show when={paginatedTracks().length > 0} 
              fallback={
                <div class="bg-[#0d0d0d]/80 border border-[#04caf4]/20 rounded-lg p-6 text-center">
                  <div class="text-4xl mb-4">🎵</div>
                  <h3 class="text-white font-bold mb-2">No tracks found</h3>
                  <p class="text-white/60 text-sm">Try adjusting your filters or check back later</p>
                </div>
              }>
              <div class="space-y-3">
                <For each={paginatedTracks()}>
                  {(track, index) => (
                    <LibraryTableRow 
                      track={track} 
                      trackNumber={((currentPage() - 1) * 50) + index() + 1}
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
          <table ref={tableRef!} class="retro-data-grid">
            <LibraryTableHeader />
            
            <Show 
              when={!isLoading() && !loadingError()} 
              fallback={
                <Show when={loadingError()} 
                  fallback={<TableLoadingSkeleton columnCount={11} />}>
                  <TableErrorState 
                    columnSpan={11} 
                    errorMessage={loadingError()} 
                    onRetry={handleRetry} 
                  />
                </Show>
              }
            >
              <Show when={paginatedTracks().length > 0} 
                fallback={
                  <TableEmptyState
                    columnSpan={11}
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