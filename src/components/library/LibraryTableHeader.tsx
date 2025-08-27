import { Component } from 'solid-js';
import { sortState, updateSort, SortColumn } from '../../stores/libraryStore';

const LibraryTableHeader: Component = () => {
  const handleSort = (column: SortColumn) => {
    updateSort(column);
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortState.column !== column) {
      return '↕';
    }
    return sortState.direction === 'asc' ? '↑' : '↓';
  };

  const getSortClass = (column: SortColumn) => {
    if (sortState.column === column) {
      return sortState.direction === 'asc' ? 'sort-asc' : 'sort-desc';
    }
    return 'sortable';
  };

  return (
    <thead class="retro-grid-header">
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
            <span class={`retro-sort-indicator ${sortState.column === 'track' ? 'opacity-100' : 'opacity-40'}`}>
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
            <span class={`retro-sort-indicator ${sortState.column === 'artist' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('artist')}
            </span>
          </div>
        </th>

        {/* Shared By Column */}
        <th 
          class={`retro-grid-header-cell ${getSortClass('sharedBy')}`}
          onClick={() => handleSort('sharedBy')}
        >
          <div class="flex items-center gap-2">
            Shared By
            <span class={`retro-sort-indicator ${sortState.column === 'sharedBy' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('sharedBy')}
            </span>
          </div>
        </th>

        {/* Context Column - Not sortable */}
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
            <span class={`retro-sort-indicator ${sortState.column === 'timestamp' ? 'opacity-100' : 'opacity-40'}`}>
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
            <span class={`retro-sort-indicator ${sortState.column === 'platform' ? 'opacity-100' : 'opacity-40'}`}>
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
            <span class={`retro-sort-indicator ${sortState.column === 'replies' ? 'opacity-100' : 'opacity-40'}`}>
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
            <span class={`retro-sort-indicator ${sortState.column === 'likes' ? 'opacity-100' : 'opacity-40'}`}>
              {getSortIcon('likes')}
            </span>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default LibraryTableHeader;