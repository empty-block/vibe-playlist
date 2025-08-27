import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { Track } from '../../stores/playlistStore';
import PersonalLibraryTableHeader from './PersonalLibraryTableHeader';
import PersonalLibraryTableRow from './PersonalLibraryTableRow';
import PersonalLibraryTableFilters from './PersonalLibraryTableFilters';
import './retro-table.css';

export interface PersonalTrack extends Track {
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast';
    timestamp: string;
    context?: string; // User's comment/share text
    socialStats?: {
      likes: number;
      replies: number;
      recasts: number;
    };
  };
}

interface PersonalLibraryTableProps {
  userId: string;
  tracks: PersonalTrack[];
  isLoading?: boolean;
  onFilterChange?: (filter: PersonalFilterType) => void;
  currentFilter?: PersonalFilterType;
  onAddMusic?: () => void;
}

export type PersonalFilterType = 'all' | 'shared' | 'liked' | 'conversations' | 'recasts';

const PersonalLibraryTable: Component<PersonalLibraryTableProps> = (props) => {
  let tableRef: HTMLTableElement | undefined;
  const [loadingError, setLoadingError] = createSignal<string>('');
  const [currentPage, setCurrentPage] = createSignal(1);
  const ITEMS_PER_PAGE = 50;

  const filteredTracks = () => {
    const allTracks = props.tracks || [];
    const filter = props.currentFilter || 'all';
    
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

  const paginatedTracks = () => {
    const tracks = filteredTracks();
    const start = (currentPage() - 1) * ITEMS_PER_PAGE;
    return tracks.slice(start, start + ITEMS_PER_PAGE);
  };

  const totalPages = () => {
    return Math.ceil(filteredTracks().length / ITEMS_PER_PAGE);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tableRef) {
      tableRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: PersonalFilterType) => {
    setCurrentPage(1);
    props.onFilterChange?.(filter);
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
                <div class="w-24 h-3 bg-slate-700 rounded"></div>
              </div>
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
          </tr>
        )}
      </For>
    </tbody>
  );

  const EmptyState = () => {
    const filter = props.currentFilter || 'all';
    const emptyMessages = {
      shared: { icon: '🎵', title: 'No tracks shared yet', subtitle: 'Start building your musical identity - share your first track!' },
      liked: { icon: '💖', title: 'No liked tracks', subtitle: 'Heart tracks that resonate with you' },
      conversations: { icon: '💬', title: 'No conversations yet', subtitle: 'Join discussions about music you love' },
      recasts: { icon: '🔄', title: 'No recasts yet', subtitle: 'Share tracks from other curators you discover' },
      all: { icon: '🎵', title: 'No musical activity yet', subtitle: 'Start your journey by sharing, liking, or discussing music' }
    };
    
    const message = emptyMessages[filter];
    
    return (
      <tbody>
        <tr>
          <td colSpan={7} class="text-center py-16">
            <div class="text-4xl mb-4">{message.icon}</div>
            <div class="text-white/70 text-lg font-semibold mb-2">{message.title}</div>
            <div class="text-white/50 text-sm">{message.subtitle}</div>
          </td>
        </tr>
      </tbody>
    );
  };

  const ErrorState = () => (
    <tbody>
      <tr>
        <td colSpan={7} class="text-center py-16">
          <div class="text-red-400/60 text-lg mb-4">⚠️</div>
          <div class="text-red-400 text-lg font-semibold mb-2">Error Loading Your Library</div>
          <div class="text-white/50 text-sm mb-4">{loadingError()}</div>
          <button
            onClick={() => setLoadingError('')}
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
      <div class="flex items-center justify-between p-4 border-t border-pink-400/20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div class="text-sm text-white/60">
          Showing {((currentPage() - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage() * ITEMS_PER_PAGE, filteredTracks().length)} of {filteredTracks().length} tracks
        </div>
        
        <div class="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage() - 1))}
            disabled={currentPage() === 1}
            class="px-3 py-1 rounded bg-slate-800 text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
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
                      ? 'bg-pink-400 text-black font-semibold' 
                      : 'bg-slate-800 text-pink-400 hover:bg-slate-700'
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
            class="px-3 py-1 rounded bg-slate-800 text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </Show>
  );

  return (
    <div class="retro-music-terminal personal-library relative">
      {/* Personal Header with Actions */}
      <div class="retro-terminal-header">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="retro-terminal-title bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              My Music Journey
            </h2>
            <p class="retro-terminal-subtitle">
              Your personal collection of shared, liked, and discussed tracks
            </p>
          </div>
          
          <div class="flex items-center gap-4">
            {/* Add Music Button */}
            {props.onAddMusic && (
              <button 
                onClick={props.onAddMusic}
                class="cyberpunk-add-btn bg-black border-2 border-green-400 text-green-400 px-4 py-2 rounded font-bold text-sm hover:bg-green-400/10 hover:shadow-lg hover:shadow-green-400/50 transition-all duration-300 hover:border-green-300 hover:text-green-300"
              >
                + Add Music
              </button>
            )}
            
            {/* Track Counter */}
            <div class="retro-track-counter bg-gradient-to-r from-pink-400/20 to-purple-400/20 border border-pink-400/30">
              {filteredTracks().length} tracks
            </div>
          </div>
        </div>
      </div>

      {/* Personal Filters */}
      <PersonalLibraryTableFilters 
        currentFilter={props.currentFilter || 'all'}
        onFilterChange={handleFilterChange}
        tracks={props.tracks || []}
      />

      {/* Personal Data Grid */}
      <div class="overflow-x-auto relative z-20">
        <table ref={tableRef!} class="retro-data-grid personal-data-grid">
          <PersonalLibraryTableHeader />
          
          <Show 
            when={!props.isLoading && !loadingError()} 
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
                    <PersonalLibraryTableRow 
                      track={track} 
                      trackNumber={((currentPage() - 1) * ITEMS_PER_PAGE) + index() + 1}
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

export default PersonalLibraryTable;