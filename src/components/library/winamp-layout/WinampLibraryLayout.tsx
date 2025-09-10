import { Component, createSignal, onMount, Show } from 'solid-js';
import { PersonalTrack, PersonalFilterType } from '../LibraryTable';
import WinampSidebar from './WinampSidebar';
import WinampMainContent from './WinampMainContent';
import './winamp-library.css';

interface WinampLibraryLayoutProps {
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

const WinampLibraryLayout: Component<WinampLibraryLayoutProps> = (props) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = createSignal(false);

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
      <WinampSidebar 
        isOpen={isMobileSidebarOpen()}
        onClose={() => setIsMobileSidebarOpen(false)}
        mode={props.mode}
        userId={props.userId}
        initialSection={props.initialSection}
      />

      {/* Main Content */}
      <WinampMainContent
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
      />
    </div>
  );
};

export default WinampLibraryLayout;