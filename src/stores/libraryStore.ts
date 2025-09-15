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
  
  // Apply network filter
  const networkFilter = selectedNetwork();
  if (networkFilter && networkFilter !== 'community') {
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
  
  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    tracks = tracks.filter(track => 
      track.title.toLowerCase().includes(searchLower) ||
      track.artist.toLowerCase().includes(searchLower) ||
      track.addedBy.toLowerCase().includes(searchLower) ||
      track.comment.toLowerCase().includes(searchLower)
    );
  }
  
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

export const updateSort = (column: SortColumn) => {
  setSortState(prev => ({
    column,
    direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
  }));
  
  // Clear shuffle state when user manually sorts
  setIsShuffled(false);
  setShuffledOrder([]);
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