import { Component, createSignal, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { PersonalTrack, PersonalFilterType } from './LibraryTable';
import LibrarySidebar from './LibrarySidebar';
import LibraryMainContent from './LibraryMainContent';
import { LibraryFilters } from './BrowseSections/BrowseSectionsContainer';
import { threadMode, threadStarter, exitThreadMode } from '../../stores/threadStore';
import './winamp-library.css';

interface LibraryLayoutProps {
  mode?: 'library' | 'profile';
  userId?: string;
  initialSection?: string;
  // Profile mode props
  personalTracks?: PersonalTrack[];
  personalLoading?: boolean;
  personalFilter?: PersonalFilterType;
  onPersonalFilterChange?: (filter: PersonalFilterType) => void;
  onAddMusic?: () => void;
}

const LibraryLayout: Component<LibraryLayoutProps> = (props) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = createSignal(false);
  
  // Browse filters state for artist/genre filtering
  const [browseFilters, setBrowseFilters] = createStore<LibraryFilters>({
    selectedArtist: null,
    selectedGenre: null,
    searchQuery: '',
    personalFilter: props.personalFilter || 'all'
  });

  // Close mobile sidebar when clicking outside or on escape
  onMount(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen()) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  });

  const handleBackdropClick = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen());
  };

  const handleBrowseFiltersChange = (newFilters: Partial<LibraryFilters>) => {
    setBrowseFilters(current => ({ ...current, ...newFilters }));
    
    // If personal filter changed, notify parent
    if (newFilters.personalFilter && props.onPersonalFilterChange) {
      props.onPersonalFilterChange(newFilters.personalFilter as PersonalFilterType);
    }
  };

  return (
    <div class="winamp-library">
      {/* Mobile Backdrop */}
      <Show when={isMobileSidebarOpen()}>
        <div 
          class="winamp-mobile-backdrop"
          onClick={handleBackdropClick}
        />
      </Show>

      {/* Sidebar */}
      <LibrarySidebar 
        isOpen={isMobileSidebarOpen()}
        onClose={() => setIsMobileSidebarOpen(false)}
        mode={props.mode}
        userId={props.userId}
        initialSection={props.initialSection}
        personalTracks={props.personalTracks}
      />

      {/* Main Content */}
      <LibraryMainContent
        mode={props.mode}
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isMobileSidebarOpen()}
        // Pass through all library table props
        personalTracks={props.personalTracks}
        personalLoading={props.personalLoading}
        personalFilter={props.personalFilter}
        onPersonalFilterChange={props.onPersonalFilterChange}
        onAddMusic={props.onAddMusic}
        userId={props.userId}
        // Browse filters
        browseFilters={browseFilters}
        onBrowseFiltersChange={handleBrowseFiltersChange}
        // Thread mode props
        threadMode={threadMode()}
        threadStarter={threadStarter()}
        onExitThread={exitThreadMode}
      />
    </div>
  );
};

export default LibraryLayout;