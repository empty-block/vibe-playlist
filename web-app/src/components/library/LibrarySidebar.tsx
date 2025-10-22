import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import LibrarySidebarSection from './LibrarySidebarSection';
import AddTrackModal from './AddTrackModal';
import { createLibrarySidebarStore, createSidebarFilter } from '../../stores/librarySidebarStore';
import { allTracks } from '../../stores/libraryStore';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

export interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  children: SidebarItem[];
  isExpandable: boolean;
}

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'library' | 'profile';
  userId?: string;
  initialSection?: string;
}

const LibrarySidebar: Component<LibrarySidebarProps> = (props) => {
  const navigate = useNavigate();
  const { 
    activeSection, 
    expandedSections, 
    setActiveSection, 
    toggleSection, 
    isExpanded,
    applyFilter,
    getSidebarCounts
  } = createLibrarySidebarStore();
  
  // Modal state management
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);
  
  // Get real-time counts
  const counts = getSidebarCounts();

  // Define sidebar structure based on mode with real counts
  const getSidebarSections = (): SidebarSection[] => {
    const currentCounts = counts;
    
    const baseSections: SidebarSection[] = [
      {
        id: 'local-library',
        label: 'Local Library',
        icon: '📚',
        isExpandable: true,
        children: [
          { id: 'all-tracks', label: 'All Tracks', count: currentCounts.allTracks },
          { id: 'recently-added', label: 'Recently Added', count: currentCounts.recentlyAdded },
          { id: 'most-played', label: 'Most Played', count: currentCounts.mostPlayed },
          { id: 'liked', label: 'Liked', count: currentCounts.liked },
        ]
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '📊',
        isExpandable: true,
        children: [
          { id: 'track-analytics', label: 'Track Analytics', count: currentCounts.allTracks },
          { id: 'discovery-stats', label: 'Discovery Stats', count: 12 },
        ]
      }
    ];

    return baseSections;
  };

  const sidebarSections = getSidebarSections();

  // Initialize with first section expanded and first item active
  onMount(() => {
    const initialSection = props.initialSection || 'local-library';
    const firstSection = sidebarSections.find(s => s.id === initialSection) || sidebarSections[0];
    
    if (firstSection && firstSection.children.length > 0) {
      if (!isExpanded(firstSection.id)) {
        toggleSection(firstSection.id);
      }
      setActiveSection(firstSection.children[0].id);
    }
  });

  const handleItemClick = (itemId: string) => {
    // Create appropriate filter based on the selected item
    const filter = createFilterForItem(itemId);
    
    if (filter) {
      applyFilter(filter);
    } else {
      // Fallback for items without specific filters
      setActiveSection(itemId);
    }
    
    // Close mobile sidebar when item is selected
    if (props.isOpen && window.innerWidth < 1024) {
      props.onClose();
    }
  };
  
  // Helper function to create filters based on sidebar item selection
  const createFilterForItem = (itemId: string) => {
    switch (itemId) {
      // Local Library items
      case 'all-tracks':
        return createSidebarFilter(itemId, 'basic', 'all-tracks');
      case 'recently-added':
        return createSidebarFilter(itemId, 'basic', 'recently-added');
      case 'most-played':
        return createSidebarFilter(itemId, 'basic', 'most-played');
      case 'liked':
        return createSidebarFilter(itemId, 'basic', 'liked');
        
      // Analytics items - navigate to stats page
      case 'track-analytics':
      case 'discovery-stats':
        navigate('/network');
        return null; // Navigation handled above, no filter needed
        
      default:
        return null;
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    toggleSection(sectionId);
  };

  const handleKeyDown = (event: KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(itemId);
    }
  };

  const handleAddTrackSubmit = (data: { songUrl: string; comment: string }) => {
    // Process the form submission
    console.log('Track data:', data);
    
    // TODO: Integrate with existing track creation logic
    // This will likely involve calling existing API endpoints
    
    // Close modal on successful submission
    setShowAddTrackModal(false);
    
    // Optional: Show success feedback
    // Could trigger a toast notification or temporary success state
  };

  return (
    <div 
      class={`winamp-sidebar ${props.isOpen ? 'mobile-open' : ''}`}
      role="navigation"
      aria-label="Library Navigation"
    >
      {/* Sidebar Header */}
      <div class="winamp-sidebar-header">
        <div class="sidebar-title">
          <span class="title-icon">🎵</span>
          <span class="title-text">LIBRARY</span>
        </div>
        
        {/* ADD_TRACK Button */}
        <button 
          class="header-add-track-btn"
          onClick={() => setShowAddTrackModal(true)}
          aria-label="Add new track"
        >
          <span class="add-icon">[</span>
          <span class="add-text">+ ADD_TRACK</span>
          <span class="add-icon">]</span>
        </button>
        
        {/* Mobile close button */}
        <Show when={props.isOpen && window.innerWidth < 1024}>
          <button
            onClick={props.onClose}
            class="mobile-close-btn"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </Show>
      </div>

      {/* Sidebar Content */}
      <div class="winamp-sidebar-content" role="tree">
        <For each={sidebarSections}>
          {(section) => (
            <LibrarySidebarSection
              section={section}
              isExpanded={isExpanded(section.id)}
              activeItem={activeSection()}
              onToggle={() => handleSectionToggle(section.id)}
              onItemClick={handleItemClick}
              onKeyDown={handleKeyDown}
            />
          )}
        </For>
      </div>

      {/* Sidebar Footer */}
      <div class="winamp-sidebar-footer">
        <div class="footer-status">
          <span class="network-status">
            TRACKS: {allTracks().length}
          </span>
        </div>
      </div>
      
      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={showAddTrackModal()}
        onClose={() => setShowAddTrackModal(false)}
        onSubmit={handleAddTrackSubmit}
      />
    </div>
  );
};

export default LibrarySidebar;