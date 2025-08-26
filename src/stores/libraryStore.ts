import { createSignal, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Track } from './playlistStore';
import { mockDataService } from '../data/mockData';

export type SortColumn = 'track' | 'artist' | 'sharedBy' | 'timestamp' | 'platform' | 'engagement';
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

// Computed filtered and sorted tracks
export const filteredTracks = createMemo(() => {
  let tracks = allTracks();
  
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
    const tracks = await mockDataService.getAllTracks();
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
};