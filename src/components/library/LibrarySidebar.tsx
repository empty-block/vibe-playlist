import { Component, createSignal, onMount, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useNavigate } from '@solidjs/router';
import LibrarySidebarSection from './LibrarySidebarSection';
import LibrarySidebarHeader from './LibrarySidebarHeader';
import LibraryFooter from './LibraryFooter';
import BrowseSectionsContainer from './BrowseSections/BrowseSectionsContainer';
import { PersonalTrack } from './LibraryTable';
import { createWinampSidebarStore, createSidebarFilter } from '../../stores/winampSidebarStore';
import { allTracks } from '../../stores/libraryStore';
import { selectedNetwork, setSelectedNetwork, fetchNetworkData } from '../../stores/networkStore';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'library' | 'profile';
  userId?: string;
  initialSection?: string;
  personalTracks?: PersonalTrack[];
}

const LibrarySidebar: Component<LibrarySidebarProps> = (props) => {
  const [expandedSections, setExpandedSections] = createStore<Record<string, boolean>>({
    'local-library': true,
    'collections': false,
    'social': false
  });

  const [selectedItem, setSelectedItem] = createSignal<string | null>('all-tracks');
  const [showBrowse, setShowBrowse] = createSignal<boolean>(false);

  // Close sidebar when item is selected on mobile
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    if (props.onClose) {
      props.onClose();
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(sectionId, !expandedSections[sectionId]);
  };

  const sections: SidebarSection[] = [
    {
      id: 'local-library',
      title: 'Local Library',
      items: [
        { id: 'all-tracks', label: 'All Tracks', icon: '🎵' },
        { id: 'recently-added', label: 'Recently Added', icon: '⏰' },
        { id: 'most-played', label: 'Most Played', icon: '🔥' },
        { id: 'liked', label: 'Liked', icon: '❤️' }
      ]
    },
    {
      id: 'collections',
      title: 'Collections',
      items: [
        { id: 'playlists', label: 'Playlists', icon: '📝' },
        { 
          id: 'by-genre', 
          label: 'By Genre', 
          icon: '🎼',
          onClick: () => setShowBrowse(!showBrowse())
        },
        { 
          id: 'by-artist', 
          label: 'By Artist', 
          icon: '🎤',
          onClick: () => setShowBrowse(!showBrowse())
        }
      ]
    }
  ];

  // Add social section only in library mode
  if (props.mode === 'library') {
    sections.push({
      id: 'social',
      title: 'Social',
      items: [
        { id: 'my-activity', label: 'My Activity', icon: '📊' },
        { id: 'following', label: 'Following', icon: '👥' },
        { id: 'discover', label: 'Discover', icon: '🔍' }
      ]
    });
  }

  return (
    <div class={`winamp-sidebar ${props.isOpen ? 'winamp-sidebar--open' : ''}`}>
      {/* Header */}
      <LibrarySidebarHeader 
        title={props.mode === 'profile' ? `${props.userId}'s Library` : 'Music Library'}
        onClose={props.onClose}
      />

      {/* Navigation */}
      <div class="winamp-sidebar__content">
        <For each={sections}>
          {(section) => (
            <LibrarySidebarSection
              section={section}
              isExpanded={expandedSections[section.id]}
              selectedItem={selectedItem()}
              onToggle={() => toggleSection(section.id)}
              onItemSelect={handleItemSelect}
            />
          )}
        </For>

        {/* Browse Sections - Show when genre/artist is selected */}
        <Show when={showBrowse()}>
          <BrowseSectionsContainer
            personalTracks={props.personalTracks}
            onFiltersChange={(filters) => {
              // Handle browse filters
              console.log('Browse filters changed:', filters);
            }}
          />
        </Show>
      </div>

      {/* Footer */}
      <LibraryFooter />
    </div>
  );
};

export default LibrarySidebar;