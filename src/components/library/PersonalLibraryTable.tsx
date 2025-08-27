import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { Track } from '../../stores/playlistStore';
import PersonalLibraryTableHeader from './PersonalLibraryTableHeader';
import PersonalLibraryTableRow from './PersonalLibraryTableRow';
import PersonalLibraryTableFilters from './PersonalLibraryTableFilters';
import TableLoadingSkeleton from './shared/TableLoadingSkeleton';
import TableEmptyState from './shared/TableEmptyState';
import TableErrorState from './shared/TableErrorState';
import TablePagination from './shared/TablePagination';
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

  const getEmptyStateProps = () => {
    const filter = props.currentFilter || 'all';
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

  return (
    <div class="retro-music-terminal personal-library relative">
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
              <Show when={loadingError()} 
                fallback={<TableLoadingSkeleton columnCount={8} />}>
                <TableErrorState 
                  columnSpan={8} 
                  errorMessage={loadingError()} 
                  onRetry={() => setLoadingError('')} 
                />
              </Show>
            }
          >
            <Show when={paginatedTracks().length > 0} 
              fallback={
                <TableEmptyState
                  columnSpan={8}
                  {...getEmptyStateProps()}
                />
              }>
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
      <TablePagination 
        currentPage={currentPage()}
        totalPages={totalPages()}
        totalItems={filteredTracks().length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PersonalLibraryTable;