import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import WinampSidebarHeader from './WinampSidebarHeader';
import WinampSidebarSection from './WinampSidebarSection';
import { createWinampSidebarStore, createSidebarFilter } from '../../../stores/winampSidebarStore';
import { allTracks } from '../../../stores/libraryStore';
import { selectedNetwork, setSelectedNetwork, fetchNetworkData } from '../../../stores/networkStore';

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

interface WinampSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'library' | 'profile';
  userId?: string;
  initialSection?: string;
  personalTracks?: any[];
}

const WinampSidebar: Component<WinampSidebarProps> = (props) => {
  const navigate = useNavigate();
  const { 
    activeSection, 
    expandedSections, 
    setActiveSection, 
    toggleSection, 
    isExpanded,
    applyFilter,
    getSidebarCounts
  } = createWinampSidebarStore();
  
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
        id: 'networks',
        label: 'Networks',
        icon: '🌐',
        isExpandable: true,
        children: [
          { id: 'personal-net', label: 'Personal', count: 147 },
          { id: 'extended-net', label: 'Extended', count: 2843 },
          { id: 'community-net', label: 'Community', count: 48392 },
          { id: 'genre-networks', label: 'Genre Networks', count: 6 },
        ]
      }
    ];

    // Add Social section for library mode
    if (props.mode !== 'profile') {
      baseSections.push({
        id: 'social',
        label: 'Social',
        icon: '🌐',
        isExpandable: true,
        children: [
          { id: 'my-activity', label: 'My Activity', count: currentCounts.myActivity },
          { id: 'following', label: 'Following', count: currentCounts.following },
          { id: 'discover', label: 'Discover', count: currentCounts.discover },
        ]
      });
    }

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
        
      // Networks - switch network and apply filter
      case 'personal-net':
        setSelectedNetwork('personal');
        fetchNetworkData('personal');
        return createSidebarFilter(itemId, 'network', 'personal');
      case 'extended-net':
        setSelectedNetwork('extended');
        fetchNetworkData('extended');
        return createSidebarFilter(itemId, 'network', 'extended');
      case 'community-net':
        setSelectedNetwork('community');
        fetchNetworkData('community');
        return createSidebarFilter(itemId, 'network', 'community');
      case 'genre-networks':
        // This could expand to show individual genre networks
        return createSidebarFilter(itemId, 'network', 'genre-networks');
        
      // Social items
      case 'my-activity':
        return createSidebarFilter(itemId, 'social', 'my-activity');
      case 'following':
        return createSidebarFilter(itemId, 'social', 'following');
      case 'discover':
        return createSidebarFilter(itemId, 'social', 'discover');
        
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

  return (
    <div 
      class={`winamp-sidebar ${props.isOpen ? 'mobile-open' : ''}`}
      role="navigation"
      aria-label="Library Navigation"
    >
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

      {/* Sidebar Header */}
      <WinampSidebarHeader />

      {/* Sidebar Content */}
      <div class="winamp-sidebar-content" role="tree">
        <For each={sidebarSections}>
          {(section) => (
            <WinampSidebarSection
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

    </div>
  );
};

export default WinampSidebar;