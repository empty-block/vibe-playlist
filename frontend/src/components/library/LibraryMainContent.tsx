import { Component, Show } from 'solid-js';
import { PersonalTrack, PersonalFilterType } from '../../types/library';
import LibraryTableFilters from './LibraryTableFilters';
import LibraryTableHeader from './LibraryTableHeader';
import LibraryTableRow from './LibraryTableRow';
import TableLoadingSkeleton from './shared/TableLoadingSkeleton';
import TableEmptyState from './shared/TableEmptyState';
import TableErrorState from './shared/TableErrorState';
import TablePagination from './shared/TablePagination';
import MobileSidebarToggle from './MobileSidebarToggle';
import BrowseSectionsContainer, { LibraryFilters } from './BrowseSections/BrowseSectionsContainer';
import ThreadStarter from './ThreadStarter';
import ThreadStatus from './ThreadStatus';
import './ThreadStarter.css';
import './ThreadStatus.css';
// WinampLibraryFooter removed - functionality moved to WinampSidebarFooter
import { filterTracksByArtist, filterTracksByGenre } from './BrowseSections/utils/browseDataExtractors';
import { paginatedTracks, isLoading, filteredTracks, totalPages, currentPage, loadAllTracks, loadFilteredTracks, filters } from '../../stores/libraryStore';
import { selectedNetwork } from '../../stores/networkStore';
import { currentUser } from '../../stores/authStore';
import { useNavigate } from '@solidjs/router';
import { For, createSignal, onMount, createMemo, createEffect } from 'solid-js';

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
  // Browse filters
  browseFilters?: LibraryFilters;
  onBrowseFiltersChange?: (filters: Partial<LibraryFilters>) => void;
  // Thread mode props
  threadMode?: boolean;
  threadStarter?: any; // Track | PersonalTrack;
  onExitThread?: () => void;
}

const WinampMainContent: Component<WinampMainContentProps> = (props) => {
  let tableRef: HTMLTableElement | undefined;
  const [loadingError, setLoadingError] = createSignal<string>('');
  const [personalCurrentPage, setPersonalCurrentPage] = createSignal(1);
  const ITEMS_PER_PAGE = 50;
  const navigate = useNavigate();

  const isProfileMode = () => props.mode === 'profile';

  // Load tracks on mount for library mode
  onMount(async () => {
    if (!isProfileMode()) {
      try {
        await loadAllTracks();
      } catch (error) {
        console.error('Error loading tracks:', error);
        setLoadingError('Failed to load tracks');
      }
    }
  });

  // React to filter changes - reload tracks when filters change
  createEffect(() => {
    if (!isProfileMode()) {
      // Access reactive store properties to trigger effect
      const currentSearch = filters.search;
      const currentPlatform = filters.platform;
      const currentDateRange = filters.dateRange;
      const currentMinEngagement = filters.minEngagement;
      
      const hasActiveFilters = currentSearch?.trim() || currentPlatform !== 'all' || 
                               currentDateRange !== 'all' || currentMinEngagement > 0;
      
      console.log('LibraryMainContent: Filter change detected:', { 
        search: currentSearch, 
        platform: currentPlatform,
        dateRange: currentDateRange,
        minEngagement: currentMinEngagement,
        hasActiveFilters 
      });
      
      // Use async function inside effect
      (async () => {
        try {
          if (hasActiveFilters) {
            console.log('LibraryMainContent: Loading filtered tracks...');
            await loadFilteredTracks();
          } else {
            console.log('LibraryMainContent: Loading all tracks...');
            await loadAllTracks();
          }
        } catch (error) {
          console.error('Error reloading tracks after filter change:', error);
          setLoadingError('Failed to reload tracks');
        }
      })();
    }
  });

  // Profile mode data handling with artist/genre filtering
  const personalFilteredTracks = () => {
    if (!isProfileMode()) return [];
    let tracks = props.personalTracks || [];
    const filter = props.personalFilter || 'all';
    
    // Apply personal filter first
    switch (filter) {
      case 'shared':
        tracks = tracks.filter(track => track.userInteraction.type === 'shared');
        break;
      case 'liked':
        tracks = tracks.filter(track => track.userInteraction.type === 'liked');
        break;
      case 'conversations':
        tracks = tracks.filter(track => track.userInteraction.type === 'conversation');
        break;
      case 'recasts':
        tracks = tracks.filter(track => track.userInteraction.type === 'recast');
        break;
      default:
        // Keep all tracks
        break;
    }

    // Apply browse filters if available
    if (props.browseFilters) {
      if (props.browseFilters.selectedArtist) {
        tracks = filterTracksByArtist(tracks, props.browseFilters.selectedArtist);
      }
      if (props.browseFilters.selectedGenre) {
        tracks = filterTracksByGenre(tracks, props.browseFilters.selectedGenre);
      }
    }
    
    return tracks;
  };

  // Library mode data handling with artist/genre filtering
  const libraryFilteredTracks = createMemo(() => {
    if (isProfileMode()) return [];
    let tracks = filteredTracks();
    
    // Apply browse filters if available
    if (props.browseFilters) {
      if (props.browseFilters.selectedArtist) {
        tracks = filterTracksByArtist(tracks, props.browseFilters.selectedArtist);
      }
      if (props.browseFilters.selectedGenre) {
        tracks = filterTracksByGenre(tracks, props.browseFilters.selectedGenre);
      }
    }
    
    return tracks;
  });

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

  // Mock thread data
  const mockThreadTracks = [
    {
      id: 'thread-1',
      title: 'Take On Me',
      artist: 'a-ha',
      album: 'Hunting High and Low',
      duration: 225,
      likes: 42,
      replies: 8,
      albumArt: 'https://via.placeholder.com/64x64/1a1a1a/00ffff?text=♪'
    },
    {
      id: 'thread-2', 
      title: 'Blue Monday',
      artist: 'New Order',
      album: 'Power, Corruption & Lies',
      duration: 447,
      likes: 38,
      replies: 12,
      albumArt: 'https://via.placeholder.com/64x64/1a1a1a/00ffff?text=♪'
    },
    {
      id: 'thread-3',
      title: 'Sweet Dreams',
      artist: 'Eurythmics', 
      album: 'Sweet Dreams (Are Made of This)',
      duration: 216,
      likes: 55,
      replies: 6,
      albumArt: 'https://via.placeholder.com/64x64/1a1a1a/00ffff?text=♪'
    },
    {
      id: 'thread-4',
      title: 'Tainted Love',
      artist: 'Soft Cell',
      album: 'Non-Stop Erotic Cabaret',
      duration: 164,
      likes: 31,
      replies: 4,
      albumArt: 'https://via.placeholder.com/64x64/1a1a1a/00ffff?text=♪'
    }
  ];

  // Helper functions for consistent data access
  const getCurrentPaginated = () => {
    if (props.threadMode) {
      // In thread mode, show mock thread tracks
      return mockThreadTracks;
    }
    return isProfileMode() ? personalPaginatedTracks() : paginatedTracks();
  };
  
  const getCurrentTotalPages = () => {
    if (props.threadMode) {
      return Math.ceil(mockThreadTracks.length / ITEMS_PER_PAGE);
    }
    return isProfileMode() ? personalTotalPages() : totalPages();
  };
  
  const getCurrentPage = () => {
    if (props.threadMode) {
      return 1; // Thread mode always shows page 1 for now
    }
    return isProfileMode() ? personalCurrentPage() : currentPage();
  };
  
  const getCurrentFiltered = () => {
    if (props.threadMode) {
      return mockThreadTracks;
    }
    return isProfileMode() ? personalFilteredTracks() : libraryFilteredTracks();
  };
  
  const getCurrentLoading = () => isProfileMode() ? props.personalLoading : isLoading();
  const columnCount = isProfileMode() ? 7 : 9; // Images simplified to play buttons
  
  // Get all tracks for browse sections (before pagination)
  const getAllTracks = () => isProfileMode() ? (props.personalTracks || []) : filteredTracks();

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
        
        {/* Profile Access - Top Right */}
        <div class="profile-access">
          <button 
            onClick={() => navigate('/profile')}
            class="profile-button group"
            title={`View ${currentUser().displayName}'s profile`}
          >
            <div class="profile-avatar">
              <img 
                src={currentUser().avatar} 
                alt={currentUser().displayName}
                class="avatar-image"
              />
              <div class="avatar-border"></div>
            </div>
            <span class="profile-username">
              {currentUser().username}
            </span>
          </button>
        </div>
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

      {/* Thread Starter OR Browse Sections - Conditional rendering */}
      <Show 
        when={props.threadMode && props.threadStarter}
        fallback={
          <Show when={props.browseFilters && props.onBrowseFiltersChange}>
            <BrowseSectionsContainer
              tracks={getAllTracks()}
              filters={props.browseFilters!}
              onFiltersChange={props.onBrowseFiltersChange!}
              isLoading={getCurrentLoading()}
            />
          </Show>
        }
      >
        <ThreadStarter 
          threadStarter={props.threadStarter!}
          conversationText="Hey everyone! I've been diving deep into 80s synthpop lately and discovered some incredible tracks that I think you'll all love. What are your absolute favorite synthpop songs from that era? I'm always looking for hidden gems and lesser-known artists that capture that perfect retro-futuristic vibe. Drop your recommendations below!"
          username="musiclover"
          userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face"
          timestamp="2h ago"
          replyCount={42}
          onClose={props.onExitThread}
          isLoading={getCurrentLoading()}
        />
      </Show>

      {/* Thread Status Indicator removed per user feedback */}

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

      {/* Footer removed - functionality consolidated into WinampSidebarFooter */}

    </div>
  );
};

export default WinampMainContent;