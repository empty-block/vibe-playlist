import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Track } from './playerStore';
import { selectedNetwork } from './networkStore';
import { libraryApiService } from '../services/libraryApiService';

export type SortColumn = 'track' | 'artist' | 'sharedBy' | 'timestamp' | 'platform' | 'engagement' | 'likes' | 'replies';
export type SortDirection = 'asc' | 'desc';
export type FilterPlatform = 'all' | 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';

export interface LibraryFilters {
  search: string;
  platform: FilterPlatform;
  dateRange: 'all' | 'today' | 'week' | 'month';
  minEngagement: number;
}

export interface LibrarySortState {
  column: SortColumn;
  direction: SortDirection;
}

// State signals
export const [allTracks, setAllTracks] = createSignal<Track[]>([]);
export const [isLoading, setIsLoading] = createSignal(false);
export const [sortState, setSortState] = createStore<LibrarySortState>({
  column: 'timestamp',
  direction: 'desc'
});
export const [filters, setFilters] = createStore<LibraryFilters>({
  search: '',
  platform: 'all',
  dateRange: 'all',
  minEngagement: 0
});

// Pagination
export const [currentPage, setCurrentPage] = createSignal(1);
export const [itemsPerPage] = createSignal(50);

// Shuffle
export const [isShuffled, setIsShuffled] = createSignal(false);
export const [shuffledOrder, setShuffledOrder] = createSignal<number[]>([]);

// Global sorting
export const [globalSortEnabled, setGlobalSortEnabled] = createSignal(false);

// Utility function to shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Computed filtered and sorted tracks
export const filteredTracks = createMemo(() => {
  let tracks = allTracks();
  
  // Skip network filtering when doing a search or when any filters are active
  // This ensures users see all results when actively filtering/searching/sorting
  const hasActiveSearch = filters.search?.trim();
  const hasActiveFilters = filters.platform !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.minEngagement > 0;
  const hasActiveSorting = sortState.column !== 'timestamp' || sortState.direction !== 'desc';
  
  // Apply network filter (but not when actively using the library features)
  const networkFilter = selectedNetwork();
  if (!hasActiveSearch && !hasActiveFilters && !hasActiveSorting && 
      networkFilter && networkFilter !== 'community') {
    // Simulate network filtering based on the selected network
    // In a real app, tracks would have network source metadata
    tracks = tracks.filter((track, index) => {
      if (networkFilter === 'personal') {
        // Show ~60% of tracks for personal network
        return index % 5 !== 0 && index % 5 !== 1;
      } else if (networkFilter === 'extended') {
        // Show ~80% of tracks for extended network
        return index % 5 !== 0;
      } else if (networkFilter.startsWith('genre-')) {
        // Filter by genre - simulate based on track characteristics
        const genre = networkFilter.replace('genre-', '');
        if (genre === 'hiphop') {
          return track.artist.toLowerCase().includes('hip') || 
                 track.title.toLowerCase().includes('rap') ||
                 index % 4 === 0;
        } else if (genre === 'electronic') {
          return track.artist.toLowerCase().includes('electr') || 
                 track.title.toLowerCase().includes('synth') ||
                 index % 4 === 1;
        } else if (genre === 'indie') {
          return track.artist.toLowerCase().includes('indie') || 
                 index % 4 === 2;
        }
      } else if (networkFilter === 'trending') {
        // Show tracks with high engagement
        return (track.likes + track.recasts + track.replies) > 10;
      }
      return true;
    });
  }
  
  // Note: Search filtering is now handled server-side via the API
  // Client-side search has been removed to use PostgreSQL functions
  
  // Apply platform filter
  if (filters.platform !== 'all') {
    tracks = tracks.filter(track => track.source === filters.platform);
  }
  
  // Apply date range filter
  if (filters.dateRange !== 'all') {
    const now = new Date();
    const cutoff = new Date();
    switch (filters.dateRange) {
      case 'today':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }
    // Filter by timestamp (assuming timestamp is a date string)
    tracks = tracks.filter(track => {
      const trackDate = new Date(track.timestamp);
      return trackDate >= cutoff;
    });
  }
  
  // Apply engagement filter
  if (filters.minEngagement > 0) {
    tracks = tracks.filter(track => 
      (track.likes + track.recasts + track.replies) >= filters.minEngagement
    );
  }
  
  return tracks;
});

export const sortedTracks = createMemo(() => {
  const tracks = [...filteredTracks()];
  
  // If shuffled, return tracks in shuffled order
  if (isShuffled() && shuffledOrder().length === tracks.length) {
    return shuffledOrder().map(index => tracks[index]);
  }
  
  // Otherwise, apply normal sorting
  const { column, direction } = sortState;
  
  tracks.sort((a, b) => {
    let comparison = 0;
    
    switch (column) {
      case 'track':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'artist':
        comparison = a.artist.localeCompare(b.artist);
        break;
      case 'sharedBy':
        comparison = a.addedBy.localeCompare(b.addedBy);
        break;
      case 'platform':
        comparison = a.source.localeCompare(b.source);
        break;
      case 'engagement':
        const aEngagement = a.likes + a.recasts + a.replies;
        const bEngagement = b.likes + b.recasts + b.replies;
        comparison = aEngagement - bEngagement;
        break;
      case 'likes':
        comparison = a.likes - b.likes;
        break;
      case 'replies':
        comparison = a.replies - b.replies;
        break;
      case 'timestamp':
        const aDate = new Date(a.timestamp);
        const bDate = new Date(b.timestamp);
        comparison = aDate.getTime() - bDate.getTime();
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return tracks;
});

export const paginatedTracks = createMemo(() => {
  const tracks = sortedTracks();
  const start = (currentPage() - 1) * itemsPerPage();
  const end = start + itemsPerPage();
  return tracks.slice(start, end);
});

export const totalPages = createMemo(() => 
  Math.ceil(sortedTracks().length / itemsPerPage())
);

// Actions
export const loadAllTracks = async () => {
  setIsLoading(true);
  try {
    const tracks = await libraryApiService.getAllTracks();
    setAllTracks(tracks);
  } catch (error) {
    console.error('Failed to load tracks:', error);
  } finally {
    setIsLoading(false);
  }
};

export const loadFilteredTracks = async () => {
  console.log('loadFilteredTracks called with filters:', filters);
  setIsLoading(true);
  try {
    // Use server-side functions for search and filters
    const response = await libraryApiService.getFilteredTracks(filters, { 
      globalSort: globalSortEnabled() 
    });
    console.log('Filtered tracks response:', response.tracks.length, 'tracks');
    setAllTracks(response.tracks);
  } catch (error) {
    console.error('Failed to load filtered tracks:', error);
  } finally {
    setIsLoading(false);
  }
};

export const loadFilteredTracksWithGlobalSort = async () => {
  setIsLoading(true);
  try {
    // Create a query that includes filters AND current sort state
    const queryWithSort = {
      ...filters,
      sortBy: sortState.column === 'track' ? 'title' : 
              sortState.column === 'sharedBy' ? 'sharedBy' :
              sortState.column === 'timestamp' ? 'timestamp' :
              sortState.column === 'platform' ? 'platform' :
              sortState.column,
      sortDirection: sortState.direction,
      globalSort: true
    };
    
    const response = await libraryApiService.queryLibrary(queryWithSort);
    
    // Update tracks with globally sorted results
    setAllTracks(response.tracks);
  } catch (error) {
    console.error('Failed to load globally sorted tracks:', error);
  } finally {
    setIsLoading(false);
  }
};

export const updateSort = (column: SortColumn, direction?: SortDirection) => {
  setSortState(prev => ({
    column,
    direction: direction || (prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc')
  }));
  
  // Clear shuffle state when user manually sorts
  setIsShuffled(false);
  setShuffledOrder([]);
  
  if (globalSortEnabled()) {
    // Trigger API call with global sorting
    loadFilteredTracksWithGlobalSort();
  }
};

export const updateFilters = (newFilters: Partial<LibraryFilters>) => {
  setFilters(prev => ({ ...prev, ...newFilters }));
  setCurrentPage(1); // Reset to first page when filters change
};

export const resetFilters = () => {
  setFilters({
    search: '',
    platform: 'all',
    dateRange: 'all',
    minEngagement: 0
  });
  setCurrentPage(1);
  
  // Also reset shuffle state
  setIsShuffled(false);
  setShuffledOrder([]);
};

export const shuffleTracks = () => {
  // Always shuffle - generate new random indices for current filtered tracks
  const trackCount = filteredTracks().length;
  const indices = Array.from({ length: trackCount }, (_, i) => i);
  setShuffledOrder(shuffleArray(indices));
  setIsShuffled(true);
  
  // Reset to first page when shuffle happens
  setCurrentPage(1);
};