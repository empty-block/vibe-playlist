import { Component, createSignal, onMount, Show } from 'solid-js';
import { PersonalTrack, PersonalFilterType } from '../../types/library';
import LibrarySidebar from './LibrarySidebar';
import LibraryMainContent from './LibraryMainContent';
// Remove local browse filters store - use library store directly
import { filters, updateFilters } from '../../stores/libraryStore';
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
  
  // Remove local browse filters state

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

  // Update library store directly
  const handleArtistSelect = (artist: string | null) => {
    if (artist) {
      // Set search field with the artist name (this was the original working behavior)
      updateFilters({ search: artist });
    } else {
      // Clear search when "All Artists" is selected
      updateFilters({ search: '' });
    }
  };

  const handleGenreSelect = (genre: string | null) => {
    if (genre && genre !== 'All Genres') {
      // Set search field with the genre name
      updateFilters({ search: genre });
    } else {
      // Clear search when "All Genres" is selected
      updateFilters({ search: '' });
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
        personalTracks={props.personalTracks}
        personalLoading={props.personalLoading}
        personalFilter={props.personalFilter}
        onPersonalFilterChange={props.onPersonalFilterChange}
        onAddMusic={props.onAddMusic}
        userId={props.userId}
        // NEW: Pass store filters directly
        selectedArtist={filters.selectedArtist}
        selectedGenre={filters.selectedGenre}
        onArtistSelect={handleArtistSelect}
        onGenreSelect={handleGenreSelect}
        threadMode={threadMode()}
        threadStarter={threadStarter()}
        onExitThread={exitThreadMode}
      />
    </div>
  );
};

export default LibraryLayout;