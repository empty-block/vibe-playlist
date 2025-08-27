import { Component, createSignal, onCleanup } from 'solid-js';
import { filters, updateFilters, resetFilters, FilterPlatform, isShuffled, shuffleTracks } from '../../stores/libraryStore';

const LibraryTableFilters: Component = () => {
  const [searchInput, setSearchInput] = createSignal(filters.search);
  let searchTimeout: any;

  // Debounced search
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      updateFilters({ search: value });
    }, 300);
  };

  const handlePlatformChange = (platform: FilterPlatform) => {
    updateFilters({ platform });
  };

  const handleDateRangeChange = (dateRange: 'all' | 'today' | 'week' | 'month') => {
    updateFilters({ dateRange });
  };

  const handleEngagementChange = (minEngagement: number) => {
    updateFilters({ minEngagement });
  };

  const handleReset = () => {
    setSearchInput('');
    resetFilters();
  };

  onCleanup(() => {
    clearTimeout(searchTimeout);
  });

  return (
    <div class="filter-bar bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-400/20 p-4 flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div class="flex-grow min-w-[250px] max-w-[400px]">
        <input
          type="text"
          placeholder="Search tracks, artists, or curators..."
          value={searchInput()}
          onInput={(e) => handleSearchInput(e.target.value)}
          class="search-input w-full bg-slate-800/80 border border-cyan-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder:text-cyan-400/50 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition-all"
        />
      </div>

      {/* Platform Filter */}
      <select
        value={filters.platform}
        onChange={(e) => handlePlatformChange(e.target.value as FilterPlatform)}
        class="filter-dropdown bg-slate-800/90 border border-cyan-400/30 rounded-lg px-3 py-2 text-cyan-400 text-sm cursor-pointer focus:outline-none focus:border-cyan-400 min-w-[120px]"
      >
        <option value="all">All Platforms</option>
        <option value="youtube">YouTube</option>
        <option value="spotify">Spotify</option>
        <option value="soundcloud">SoundCloud</option>
        <option value="bandcamp">Bandcamp</option>
      </select>

      {/* Date Range Filter */}
      <select
        value={filters.dateRange}
        onChange={(e) => handleDateRangeChange(e.target.value as 'all' | 'today' | 'week' | 'month')}
        class="filter-dropdown bg-slate-800/90 border border-cyan-400/30 rounded-lg px-3 py-2 text-cyan-400 text-sm cursor-pointer focus:outline-none focus:border-cyan-400 min-w-[120px]"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>

      {/* Engagement Filter */}
      <div class="flex items-center gap-2">
        <label class="text-cyan-400 text-sm font-mono">Min Engagement:</label>
        <input
          type="number"
          min="0"
          value={filters.minEngagement}
          onChange={(e) => handleEngagementChange(parseInt(e.target.value) || 0)}
          class="bg-slate-800/80 border border-cyan-400/30 rounded px-2 py-1 text-white text-sm w-16 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Shuffle Button */}
      <button
        onClick={shuffleTracks}
        class={`shuffle-btn flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono font-semibold transition-all duration-300 transform ${
          isShuffled() 
            ? 'bg-gradient-to-r from-slate-800 to-emerald-900/20 border border-green-400 text-green-400 shadow-lg shadow-green-400/20' 
            : 'bg-gradient-to-r from-slate-900 to-slate-800 border border-cyan-400/30 text-cyan-400/70 hover:border-cyan-400/50 hover:text-cyan-400'
        } hover:scale-102 active:scale-95`}
        style={{
          'box-shadow': isShuffled() 
            ? '0 0 12px rgba(0, 249, 42, 0.3), 0 0 24px rgba(0, 249, 42, 0.1)' 
            : '0 0 8px rgba(4, 202, 244, 0.1)'
        }}
      >
        <span class="text-base">⤮</span>
        SHUFFLE
      </button>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        class="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-orange-400 hover:to-pink-400 transition-all transform hover:scale-105 active:scale-95"
      >
        Reset
      </button>

      {/* Active Filters Display */}
      <div class="flex flex-wrap gap-2">
        {filters.search && (
          <div class="filter-pill flex items-center bg-cyan-400/15 border border-cyan-400/40 rounded-full px-3 py-1 text-cyan-400 text-xs gap-2">
            <span>"{filters.search}"</span>
            <button 
              onClick={() => {
                setSearchInput('');
                updateFilters({ search: '' });
              }}
              class="filter-pill-close opacity-70 hover:opacity-100 hover:text-orange-400 transition-all"
            >
              ×
            </button>
          </div>
        )}
        
        {filters.platform !== 'all' && (
          <div class="filter-pill flex items-center bg-cyan-400/15 border border-cyan-400/40 rounded-full px-3 py-1 text-cyan-400 text-xs gap-2">
            <span>{filters.platform}</span>
            <button 
              onClick={() => updateFilters({ platform: 'all' })}
              class="filter-pill-close opacity-70 hover:opacity-100 hover:text-orange-400 transition-all"
            >
              ×
            </button>
          </div>
        )}

        {filters.dateRange !== 'all' && (
          <div class="filter-pill flex items-center bg-cyan-400/15 border border-cyan-400/40 rounded-full px-3 py-1 text-cyan-400 text-xs gap-2">
            <span>{filters.dateRange}</span>
            <button 
              onClick={() => updateFilters({ dateRange: 'all' })}
              class="filter-pill-close opacity-70 hover:opacity-100 hover:text-orange-400 transition-all"
            >
              ×
            </button>
          </div>
        )}

        {filters.minEngagement > 0 && (
          <div class="filter-pill flex items-center bg-cyan-400/15 border border-cyan-400/40 rounded-full px-3 py-1 text-cyan-400 text-xs gap-2">
            <span>engagement ≥ {filters.minEngagement}</span>
            <button 
              onClick={() => updateFilters({ minEngagement: 0 })}
              class="filter-pill-close opacity-70 hover:opacity-100 hover:text-orange-400 transition-all"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryTableFilters;