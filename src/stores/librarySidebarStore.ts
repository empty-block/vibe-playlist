import { createSignal, createMemo } from 'solid-js';
import { 
  allTracks, 
  filteredTracks, 
  updateFilters, 
  resetFilters,
  LibraryFilters,
  FilterPlatform,
  setCurrentPage
} from './libraryStore';
import { selectedNetwork, setSelectedNetwork } from './networkStore';

// Enhanced filter types for sidebar navigation
export interface SidebarLibraryFilter {
  type: 'basic' | 'engagement' | 'date' | 'platform' | 'network' | 'social';
  value: any;
  searchOverride?: string;
  additionalFilters?: Partial<LibraryFilters>;
}

export interface LibraryFilter {
  section: string;
  filter?: SidebarLibraryFilter;
}

interface WinampSidebarState {
  activeSection: string;
  expandedSections: Set<string>;
  isMobileOpen: boolean;
  currentFilter: LibraryFilter | null;
}

// State persistence keys
const STORAGE_KEYS = {
  expandedSections: 'jamzy_sidebar_expanded_sections',
  activeSection: 'jamzy_sidebar_active_section'
};

// Helper functions for localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail if localStorage is unavailable
  }
};

// Load initial state from localStorage
const loadInitialExpandedSections = (): Set<string> => {
  const stored = loadFromStorage(STORAGE_KEYS.expandedSections, ['local-library']);
  return new Set(Array.isArray(stored) ? stored : ['local-library']);
};

const loadInitialActiveSection = (): string => {
  return loadFromStorage(STORAGE_KEYS.activeSection, 'all-tracks');
};

// Create signals for sidebar state with persistence
const [activeSection, setActiveSectionSignal] = createSignal<string>(loadInitialActiveSection());
const [expandedSections, setExpandedSectionsSignal] = createSignal<Set<string>>(loadInitialExpandedSections());
const [isMobileOpen, setIsMobileOpen] = createSignal<boolean>(false);
const [currentFilter, setCurrentFilter] = createSignal<LibraryFilter | null>(null);

// Wrapper functions that handle persistence
const setActiveSection = (section: string) => {
  setActiveSectionSignal(section);
  saveToStorage(STORAGE_KEYS.activeSection, section);
};

const setExpandedSections = (sections: Set<string>) => {
  setExpandedSectionsSignal(sections);
  saveToStorage(STORAGE_KEYS.expandedSections, Array.from(sections));
};

// Helper functions
const isExpanded = (sectionId: string): boolean => {
  return expandedSections().has(sectionId);
};

const toggleSection = (sectionId: string): void => {
  const expanded = expandedSections();
  const newExpanded = new Set(expanded);
  
  if (newExpanded.has(sectionId)) {
    newExpanded.delete(sectionId);
  } else {
    newExpanded.add(sectionId);
  }
  
  setExpandedSections(newExpanded);
};

const expandSection = (sectionId: string): void => {
  const expanded = expandedSections();
  if (!expanded.has(sectionId)) {
    const newExpanded = new Set(expanded);
    newExpanded.add(sectionId);
    setExpandedSections(newExpanded);
  }
};

const collapseSection = (sectionId: string): void => {
  const expanded = expandedSections();
  if (expanded.has(sectionId)) {
    const newExpanded = new Set(expanded);
    newExpanded.delete(sectionId);
    setExpandedSections(newExpanded);
  }
};

const applyFilter = (filter: LibraryFilter): void => {
  setCurrentFilter(filter);
  setActiveSection(filter.section);
  
  // Auto-expand the section containing the active item
  if (filter.section.includes('-')) {
    const parentSection = getParentSection(filter.section);
    if (parentSection) {
      expandSection(parentSection);
    }
  }
  
  // Apply the actual filtering logic to the library
  if (filter.filter) {
    applySidebarFilterToLibrary(filter.filter);
  }
  
  // Reset to first page when changing filters
  setCurrentPage(1);
};

// Function to translate sidebar filters to library store filters
const applySidebarFilterToLibrary = (sidebarFilter: SidebarLibraryFilter): void => {
  const { type, value, searchOverride, additionalFilters } = sidebarFilter;
  
  // Reset filters first for clean state
  resetFilters();
  
  switch (type) {
    case 'basic':
      // Handle basic library sections like 'all-tracks', 'recently-added', etc.
      switch (value) {
        case 'recently-added':
          updateFilters({ dateRange: 'week' });
          break;
        case 'most-played':
          updateFilters({ minEngagement: 10 });
          break;
        case 'liked':
          // In a real app, this would filter for user-liked tracks
          // For now, simulate by filtering high-engagement tracks
          updateFilters({ minEngagement: 15 });
          break;
        case 'all-tracks':
        default:
          // No additional filters needed for all tracks
          break;
      }
      break;
      
    case 'platform':
      updateFilters({ platform: value as FilterPlatform });
      break;
      
    case 'date':
      updateFilters({ dateRange: value });
      break;
      
    case 'engagement':
      updateFilters({ minEngagement: value });
      break;
      
    case 'network':
      setSelectedNetwork(value);
      break;
      
    case 'social':
      // Handle social filtering
      switch (value) {
        case 'trending':
          setSelectedNetwork('trending');
          break;
        case 'following':
          setSelectedNetwork('extended');
          break;
        case 'discover':
          setSelectedNetwork('community');
          break;
        case 'my-activity':
        default:
          setSelectedNetwork('personal');
          break;
      }
      break;
  }
  
  // Apply search override if provided
  if (searchOverride) {
    updateFilters({ search: searchOverride });
  }
  
  // Apply any additional filters
  if (additionalFilters) {
    updateFilters(additionalFilters);
  }
};

// Helper to determine parent section from item ID
const getParentSection = (itemId: string): string | null => {
  const sectionMap: Record<string, string> = {
    'all-tracks': 'local-library',
    'recently-added': 'local-library',
    'most-played': 'local-library',
    'liked': 'local-library',
    'playlists': 'collections',
    'by-genre': 'collections',
    'by-user': 'collections',
    'my-activity': 'social',
    'following': 'social',
    'discover': 'social',
  };
  
  return sectionMap[itemId] || null;
};

// Computed values for sidebar data
const getSidebarCounts = createMemo(() => {
  const tracks = allTracks();
  
  // Calculate counts for different sections
  const allTracksCount = tracks.length;
  const recentlyAddedCount = tracks.filter(track => {
    const trackDate = new Date(track.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return trackDate >= weekAgo;
  }).length;
  
  const mostPlayedCount = tracks.filter(track => 
    (track.likes + track.recasts + track.replies) >= 10
  ).length;
  
  const likedCount = tracks.filter(track => 
    (track.likes + track.recasts + track.replies) >= 15
  ).length;
  
  // Platform counts
  const youtubeCount = tracks.filter(t => t.source === 'youtube').length;
  const spotifyCount = tracks.filter(t => t.source === 'spotify').length;
  const soundcloudCount = tracks.filter(t => t.source === 'soundcloud').length;
  const bandcampCount = tracks.filter(t => t.source === 'bandcamp').length;
  
  // Genre counts (simulated)
  const hiphopCount = tracks.filter(t => 
    t.artist.toLowerCase().includes('hip') || 
    t.title.toLowerCase().includes('rap')
  ).length;
  
  const electronicCount = tracks.filter(t => 
    t.artist.toLowerCase().includes('electr') || 
    t.title.toLowerCase().includes('synth')
  ).length;
  
  const indieCount = tracks.filter(t => 
    t.artist.toLowerCase().includes('indie')
  ).length;
  
  return {
    // Local Library counts
    allTracks: allTracksCount,
    recentlyAdded: recentlyAddedCount,
    mostPlayed: mostPlayedCount,
    liked: likedCount,
    
    // Collection counts
    playlists: 0, // Will be implemented with playlist integration
    genres: {
      hiphop: hiphopCount,
      electronic: electronicCount,
      indie: indieCount,
      total: Math.max(hiphopCount + electronicCount + indieCount, 1)
    },
    platforms: {
      youtube: youtubeCount,
      spotify: spotifyCount,
      soundcloud: soundcloudCount,
      bandcamp: bandcampCount,
      total: youtubeCount + spotifyCount + soundcloudCount + bandcampCount
    },
    
    // Social counts (simulated)
    myActivity: Math.floor(allTracksCount * 0.3),
    following: Math.floor(allTracksCount * 0.6),
    discover: allTracksCount
  };
});

// Create sidebar filter presets
const createSidebarFilter = (section: string, type: SidebarLibraryFilter['type'], value: any, additionalOptions?: Partial<SidebarLibraryFilter>): LibraryFilter => {
  return {
    section,
    filter: {
      type,
      value,
      ...additionalOptions
    }
  };
};

// Create a store factory function for component use
export const createLibrarySidebarStore = () => {
  return {
    // State
    activeSection,
    expandedSections,
    isMobileOpen,
    currentFilter,
    
    // Actions
    setActiveSection,
    setExpandedSections,
    setIsMobileOpen,
    setCurrentFilter,
    
    // Helper functions
    isExpanded,
    toggleSection,
    expandSection,
    collapseSection,
    applyFilter,
    getParentSection,
    
    // New data functions
    getSidebarCounts,
    createSidebarFilter,
    resetUserPreferences,
  };
};

// Reset user preferences (useful for debugging or user preference reset)
const resetUserPreferences = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.expandedSections);
    localStorage.removeItem(STORAGE_KEYS.activeSection);
  } catch {
    // Silent fail
  }
  
  // Reset to defaults
  setExpandedSections(new Set(['local-library']));
  setActiveSection('all-tracks');
};

// Export individual functions and signals for direct use
export {
  activeSection,
  expandedSections,
  isMobileOpen,
  currentFilter,
  setActiveSection,
  setExpandedSections,
  setIsMobileOpen,
  setCurrentFilter,
  isExpanded,
  toggleSection,
  expandSection,
  collapseSection,
  applyFilter,
  getParentSection,
  getSidebarCounts,
  createSidebarFilter,
  applySidebarFilterToLibrary,
  resetUserPreferences,
};