import { Component, onMount, For, Show, createSignal } from 'solid-js';
import { paginatedTracks, loadAllTracks, isLoading, filteredTracks, totalPages, currentPage, setCurrentPage } from '../../stores/libraryStore';
import { Track } from '../../stores/playlistStore';
import WinampLibraryLayout from './winamp-layout/WinampLibraryLayout';
import './retro-table.css';

// Import PersonalTrack type from PersonalLibraryTable
export interface PersonalTrack extends Track {
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast';
    timestamp: string;
    context?: string;
    socialStats?: {
      likes: number;
      replies: number;
      recasts: number;
    };
  };
}

export type PersonalFilterType = 'all' | 'shared' | 'liked' | 'conversations' | 'recasts';

interface LibraryTableProps {
  mode?: 'library' | 'profile';
  // Profile mode props
  personalTracks?: PersonalTrack[];
  personalLoading?: boolean;
  personalFilter?: PersonalFilterType;
  onPersonalFilterChange?: (filter: PersonalFilterType) => void;
  onAddMusic?: () => void;
  userId?: string;
}

// Removed PersonalFilters - now integrated into LibraryTableFilters

const LibraryTable: Component<LibraryTableProps> = (props) => {
  // Load all tracks on mount for library mode
  onMount(async () => {
    if (props.mode !== 'profile') {
      try {
        await loadAllTracks();
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    }
  });

  return (
    <WinampLibraryLayout
      mode={props.mode}
      userId={props.userId}
      personalTracks={props.personalTracks}
      personalLoading={props.personalLoading}
      personalFilter={props.personalFilter}
      onPersonalFilterChange={props.onPersonalFilterChange}
      onAddMusic={props.onAddMusic}
    />
  );
};

export default LibraryTable;