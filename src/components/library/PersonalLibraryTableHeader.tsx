import { Component, createSignal } from 'solid-js';

export type PersonalSortColumn = 'track' | 'artist' | 'interaction' | 'timestamp' | 'platform' | 'replies' | 'likes';

interface PersonalLibraryTableHeaderProps {
  onSort?: (column: PersonalSortColumn, direction: 'asc' | 'desc') => void;
}

const PersonalLibraryTableHeader: Component<PersonalLibraryTableHeaderProps> = (props) => {
  const [sortState, setSortState] = createSignal<{column: PersonalSortColumn | null, direction: 'asc' | 'desc'}>({
    column: 'timestamp', 
    direction: 'desc' // Most recent activity first by default
  });

  const handleSort = (column: PersonalSortColumn) => {
    const currentSort = sortState();
    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (currentSort.column === column) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Default directions for different columns
      newDirection = column === 'timestamp' ? 'desc' : 'asc';
    }
    
    setSortState({ column, direction: newDirection });
    props.onSort?.(column, newDirection);
  };

  const getSortIcon = (column: PersonalSortColumn) => {
    const currentSort = sortState();
    if (currentSort.column !== column) {
      return '↕';
    }
    return currentSort.direction === 'asc' ? '↑' : '↓';
  };

  const getSortClass = (column: PersonalSortColumn) => {
    const currentSort = sortState();
    if (currentSort.column === column) {
      return currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc';
    }
    return 'sortable';
  };

  return (
    <thead class="retro-grid-header personal-grid-header">
      <tr>
        {/* Track Number Column */}
        <th class="retro-grid-header-cell w-12 text-center">
          <div class="flex items-center justify-center">
            #
          </div>
        </th>

        {/* Track Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('track')}`}
          onClick={() => handleSort('track')}
        >
          <div class="flex items-center gap-2">
            Track
            <span class={`retro-sort-indicator ${sortState().column === 'track' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('track')}
            </span>
          </div>
        </th>

        {/* Artist Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('artist')}`}
          onClick={() => handleSort('artist')}
        >
          <div class="flex items-center gap-2">
            Artist
            <span class={`retro-sort-indicator ${sortState().column === 'artist' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('artist')}
            </span>
          </div>
        </th>

        {/* My Interaction Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('interaction')}`}
          onClick={() => handleSort('interaction')}
        >
          <div class="flex items-center gap-2">
            <span class="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-bold">
              My Interaction
            </span>
            <span class={`retro-sort-indicator ${sortState().column === 'interaction' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('interaction')}
            </span>
          </div>
        </th>

        {/* Context Column */}
        <th class="retro-grid-header-cell">
          <div class="flex items-center gap-2">
            Context
          </div>
        </th>

        {/* When Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('timestamp')}`}
          onClick={() => handleSort('timestamp')}
        >
          <div class="flex items-center gap-2">
            When
            <span class={`retro-sort-indicator ${sortState().column === 'timestamp' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('timestamp')}
            </span>
          </div>
        </th>

        {/* Platform Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('platform')}`}
          onClick={() => handleSort('platform')}
        >
          <div class="flex items-center gap-2">
            Platform
            <span class={`retro-sort-indicator ${sortState().column === 'platform' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('platform')}
            </span>
          </div>
        </th>

        {/* Replies Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('replies')}`}
          onClick={() => handleSort('replies')}
        >
          <div class="flex items-center gap-2">
            Replies
            <span class={`retro-sort-indicator ${sortState().column === 'replies' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('replies')}
            </span>
          </div>
        </th>

        {/* Likes Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('likes')}`}
          onClick={() => handleSort('likes')}
        >
          <div class="flex items-center gap-2">
            Likes
            <span class={`retro-sort-indicator ${sortState().column === 'likes' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('likes')}
            </span>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default PersonalLibraryTableHeader;