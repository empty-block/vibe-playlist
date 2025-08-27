import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { paginatedTracks, loadAllTracks, isLoading, filteredTracks, totalPages, currentPage, setCurrentPage } from '../../stores/libraryStore';
import LibraryTableHeader from './LibraryTableHeader';
import LibraryTableRow from './LibraryTableRow';
import LibraryTableFilters from './LibraryTableFilters';
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

  const LoadingSkeleton = () => (
    <tbody>
      <For each={Array(10).fill(null)}>
        {() => (
          <tr class="table-row bg-slate-900/60 border-b border-cyan-400/10 animate-pulse">
            <td class="table-cell p-4 w-12 text-center">
              <div class="w-6 h-3 bg-slate-700 rounded mx-auto"></div>
            </td>
            <td class="table-cell p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-slate-700 rounded-lg"></div>
                <div>
                  <div class="w-32 h-4 bg-slate-700 rounded mb-2"></div>
                  <div class="w-24 h-3 bg-slate-700 rounded"></div>
                </div>
              </div>
            </td>
            <td class="table-cell p-4">
              <div class="w-20 h-3 bg-slate-700 rounded"></div>
            </td>
            <td class="table-cell p-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div class="w-16 h-3 bg-slate-700 rounded"></div>
              </div>
            </td>
            <td class="table-cell p-4">
              <div class="w-8 h-3 bg-slate-700 rounded"></div>
            </td>
            <td class="table-cell p-4">
              <div class="w-16 h-6 bg-slate-700 rounded-full"></div>
            </td>
            <td class="table-cell p-4">
              <div class="flex gap-2">
                <div class="w-6 h-3 bg-slate-700 rounded"></div>
                <div class="w-6 h-3 bg-slate-700 rounded"></div>
                <div class="w-6 h-3 bg-slate-700 rounded"></div>
              </div>
            </td>
            <td class="table-cell p-4">
              <div class="w-32 h-8 bg-slate-700 rounded"></div>
            </td>
            <td class="table-cell p-4">
              <div class="flex gap-1 items-center">
                <div class="w-4 h-4 bg-slate-700 rounded"></div>
                <div class="w-6 h-3 bg-slate-700 rounded"></div>
              </div>
            </td>
            <td class="table-cell p-4">
              <div class="flex gap-1 items-center">
                <div class="w-4 h-4 bg-slate-700 rounded"></div>
                <div class="w-6 h-3 bg-slate-700 rounded"></div>
              </div>
            </td>
          </tr>
        )}
      </For>
    </tbody>
  );

  const EmptyState = () => (
    <tbody>
      <tr>
        <td colSpan={9} class="text-center py-16">
          <div class="text-cyan-400/60 text-lg mb-4">🎵</div>
          <div class="text-white/70 text-lg font-semibold mb-2">No tracks found</div>
          <div class="text-white/50 text-sm">Try adjusting your filters or check back later</div>
        </td>
      </tr>
    </tbody>
  );

  const ErrorState = () => (
    <tbody>
      <tr>
        <td colSpan={9} class="text-center py-16">
          <div class="text-red-400/60 text-lg mb-4">⚠️</div>
          <div class="text-red-400 text-lg font-semibold mb-2">Error Loading Library</div>
          <div class="text-white/50 text-sm mb-4">{loadingError()}</div>
          <button
            onClick={() => {
              setLoadingError('');
              loadAllTracks();
            }}
            class="bg-cyan-400/20 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-400/30 transition-colors"
          >
            Try Again
          </button>
        </td>
      </tr>
    </tbody>
  );

  const Pagination = () => (
    <Show when={totalPages() > 1}>
      <div class="flex items-center justify-between p-4 border-t border-cyan-400/20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div class="text-sm text-white/60">
          Showing {((currentPage() - 1) * 50) + 1} to {Math.min(currentPage() * 50, filteredTracks().length)} of {filteredTracks().length} tracks
        </div>
        
        <div class="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage() - 1))}
            disabled={currentPage() === 1}
            class="px-3 py-1 rounded bg-slate-800 text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          
          <div class="flex gap-1">
            <For each={Array.from({ length: Math.min(5, totalPages()) }, (_, i) => {
              const start = Math.max(1, currentPage() - 2);
              return start + i;
            }).filter(page => page <= totalPages())}>
              {(page) => (
                <button
                  onClick={() => handlePageChange(page)}
                  class={`px-3 py-1 rounded transition-colors ${
                    page === currentPage() 
                      ? 'bg-cyan-400 text-black font-semibold' 
                      : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              )}
            </For>
          </div>
          
          <button
            onClick={() => handlePageChange(Math.min(totalPages(), currentPage() + 1))}
            disabled={currentPage() === totalPages()}
            class="px-3 py-1 rounded bg-slate-800 text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </Show>
  );

  return (
    <div class="retro-music-terminal relative">
      {/* Clean Header */}
      <div class="retro-terminal-header">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="retro-terminal-title">
              Collective Music Library
            </h2>
            <p class="retro-terminal-subtitle">
              Discover music shared by the community
            </p>
          </div>
          <div class="retro-track-counter">
            {filteredTracks().length} tracks
          </div>
        </div>
      </div>

      {/* Filters */}
      <LibraryTableFilters />

      {/* Library Data Grid */}
      <div class="overflow-x-auto relative z-20">
        <table ref={tableRef!} class="retro-data-grid">
          <LibraryTableHeader />
          
          <Show 
            when={!isLoading() && !loadingError()} 
            fallback={
              <Show when={loadingError()} fallback={<LoadingSkeleton />}>
                <ErrorState />
              </Show>
            }
          >
            <Show when={paginatedTracks().length > 0} fallback={<EmptyState />}>
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
      <Pagination />
    </div>
  );
};

export default LibraryTable;