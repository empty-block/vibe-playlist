import { Component, createSignal, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { filters, updateFilters, resetFilters, FilterPlatform, isShuffled, shuffleTracks, filteredTracks } from '../../stores/libraryStore';
import AddButton from '../shared/AddButton';

const LibraryTableFilters: Component = () => {
  const navigate = useNavigate();
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
    <div class="terminal-query-interface bg-[#0d0d0d] border-2 border-[#04caf4]/20 p-4 font-mono">
      {/* Search Input - Full Width Row */}
      <div class="mb-3">
        <div class="relative">
          <input
            type="text"
            placeholder="SEARCH_QUERY > "
            value={searchInput()}
            onInput={(e) => handleSearchInput(e.target.value)}
            class="terminal-search w-full bg-[rgba(0,0,0,0.8)] border border-[#00f92a] text-[#00f92a] font-mono text-xs px-3 py-2.5 
                   focus:outline-none focus:border-[#00f92a] focus:shadow-[inset_0_0_5px_rgba(0,249,42,0.2),0_0_10px_rgba(0,249,42,0.3)]
                   placeholder:text-[rgba(0,249,42,0.5)] transition-all duration-200
                   hover:shadow-[0_0_8px_rgba(0,249,42,0.2)]"
            style="border-radius: 0; box-shadow: inset 0 0 5px rgba(0, 249, 42, 0.1);"
          />
          
          {/* Terminal cursor effect when focused */}
          <div class={`absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00f92a] text-xs
                      ${searchInput().length === 0 ? 'animate-pulse' : 'hidden'}`}>
            _
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div class="flex flex-wrap items-center gap-2 mb-3">
        {/* Platform Dropdown */}
        <div class="relative">
          <select
            value={filters.platform}
            onChange={(e) => handlePlatformChange(e.target.value as FilterPlatform)}
            class="terminal-select bg-[rgba(0,0,0,0.9)] border border-[#04caf4] text-[#04caf4] font-mono text-[10px] 
                   px-3 py-2 min-w-[120px] uppercase tracking-wide cursor-pointer transition-all duration-200
                   hover:border-[#04caf4] hover:shadow-[0_0_8px_rgba(4,202,244,0.2)]
                   focus:outline-none focus:shadow-[0_0_12px_rgba(4,202,244,0.3)]"
            style="border-radius: 0; text-shadow: 0 0 6px rgba(4, 202, 244, 0.4);"
          >
            <option value="all" class="bg-[#0d0d0d] text-[#04caf4]">PLATFORM_ALL</option>
            <option value="youtube" class="bg-[#0d0d0d] text-[#04caf4]">PLATFORM_YOUTUBE</option>
            <option value="spotify" class="bg-[#0d0d0d] text-[#04caf4]">PLATFORM_SPOTIFY</option>
            <option value="soundcloud" class="bg-[#0d0d0d] text-[#04caf4]">PLATFORM_SOUNDCLOUD</option>
            <option value="bandcamp" class="bg-[#0d0d0d] text-[#04caf4]">PLATFORM_BANDCAMP</option>
          </select>
        </div>

        {/* Time Period Dropdown */}
        <div class="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as 'all' | 'today' | 'week' | 'month')}
            class="terminal-select bg-[rgba(0,0,0,0.9)] border border-[#ffff00] text-[#ffff00] font-mono text-[10px] 
                   px-3 py-2 min-w-[110px] uppercase cursor-pointer transition-all duration-200
                   hover:shadow-[0_0_8px_rgba(255,255,0,0.2)]
                   focus:outline-none focus:shadow-[0_0_12px_rgba(255,255,0,0.3)]"
            style="border-radius: 0; text-shadow: 0 0 6px rgba(255, 255, 0, 0.4);"
          >
            <option value="all" class="bg-[#0d0d0d] text-[#ffff00]">TIME_ALL</option>
            <option value="today" class="bg-[#0d0d0d] text-[#ffff00]">TIME_TODAY</option>
            <option value="week" class="bg-[#0d0d0d] text-[#ffff00]">TIME_WEEK</option>
            <option value="month" class="bg-[#0d0d0d] text-[#ffff00]">TIME_MONTH</option>
          </select>
        </div>

        {/* Min Engagement Input */}
        <div class="flex items-center">
          <input
            type="number"
            min="0"
            value={filters.minEngagement}
            onChange={(e) => handleEngagementChange(parseInt(e.target.value) || 0)}
            class="terminal-input bg-[rgba(0,0,0,0.9)] border border-[#ff6b35] text-[#ff6b35] font-mono text-[10px] 
                   px-3 py-2 w-20 text-center uppercase cursor-pointer transition-all duration-200
                   hover:shadow-[0_0_8px_rgba(255,107,53,0.2)]
                   focus:outline-none focus:shadow-[0_0_12px_rgba(255,107,53,0.3)]"
            placeholder="0"
            style="border-radius: 0; text-shadow: 0 0 6px rgba(255, 107, 53, 0.4);"
          />
          <span class="text-[#ff6b35] font-mono text-[9px] ml-2 opacity-70 uppercase tracking-wide">MIN_ENG</span>
        </div>

        {/* Actions Group */}
        <div class="flex items-center gap-2 ml-auto">
          {/* Shuffle Button */}
          <button
            onClick={shuffleTracks}
            class={`terminal-action-btn bg-[rgba(0,249,42,0.1)] border border-[#00f92a] text-[#00f92a] font-mono text-[10px] 
                   px-3 py-2 uppercase tracking-wider font-bold transition-all duration-200 relative overflow-hidden
                   hover:bg-[rgba(0,249,42,0.2)] hover:shadow-[0_0_10px_rgba(0,249,42,0.3)]
                   ${isShuffled() ? 'animate-pulse shadow-[0_0_15px_rgba(0,249,42,0.4)]' : ''}`}
            style="border-radius: 0; text-shadow: 0 0 6px rgba(0, 249, 42, 0.4);"
          >
            <span class="opacity-70">RUN </span>SHUFFLE
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            class="terminal-action-btn bg-[rgba(255,107,53,0.1)] border border-[#ff6b35] text-[#ff6b35] font-mono text-[10px] 
                   px-3 py-2 uppercase tracking-wider font-bold transition-all duration-200 relative overflow-hidden
                   hover:bg-[rgba(255,107,53,0.2)] hover:shadow-[0_0_10px_rgba(255,107,53,0.3)]"
            style="border-radius: 0; text-shadow: 0 0 6px rgba(255, 107, 53, 0.4);"
          >
            <span class="opacity-70">CLEAR </span>RESET
          </button>

          {/* Add Track Button */}
          <button
            onClick={() => navigate('/curate')}
            class="terminal-add-btn bg-gradient-to-r from-[#f906d6] to-[#ff0080] border border-[#f906d6] text-black font-mono text-[10px] 
                   px-4 py-2 uppercase tracking-wider font-bold transition-all duration-200 relative overflow-hidden
                   hover:shadow-[0_0_10px_rgba(249,6,214,0.3)] hover:from-[#ff0080] hover:to-[#f906d6]
                   active:scale-95"
            style="border-radius: 0;"
          >
            <i class="fas fa-plus text-[8px] mr-1"></i>
            ADD_TRACK
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.platform !== 'all' || filters.dateRange !== 'all' || filters.minEngagement > 0) && (
        <div class="border-t border-[#04caf4]/20 pt-3">
          <div class="text-[#04caf4] font-mono text-[9px] uppercase tracking-wide mb-2 opacity-70">
            ACTIVE_FILTERS:
          </div>
          <div class="flex flex-wrap gap-2">
            {filters.search && (
              <div class="terminal-filter-pill bg-[rgba(0,249,42,0.1)] border border-[#00f92a] text-[#00f92a] font-mono text-[9px] 
                          px-2 py-1 flex items-center gap-1 uppercase tracking-wide"
                   style="border-radius: 0; text-shadow: 0 0 4px rgba(0, 249, 42, 0.4);">
                <span>QUERY:"{filters.search}"</span>
                <button 
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ search: '' });
                  }}
                  class="text-[#ff6b35] hover:text-[#ff0000] transition-colors ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.platform !== 'all' && (
              <div class="terminal-filter-pill bg-[rgba(4,202,244,0.1)] border border-[#04caf4] text-[#04caf4] font-mono text-[9px] 
                          px-2 py-1 flex items-center gap-1 uppercase tracking-wide"
                   style="border-radius: 0; text-shadow: 0 0 4px rgba(4, 202, 244, 0.4);">
                <span>PLATFORM:{filters.platform.toUpperCase()}</span>
                <button 
                  onClick={() => updateFilters({ platform: 'all' })}
                  class="text-[#ff6b35] hover:text-[#ff0000] transition-colors ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {filters.dateRange !== 'all' && (
              <div class="terminal-filter-pill bg-[rgba(255,255,0,0.1)] border border-[#ffff00] text-[#ffff00] font-mono text-[9px] 
                          px-2 py-1 flex items-center gap-1 uppercase tracking-wide"
                   style="border-radius: 0; text-shadow: 0 0 4px rgba(255, 255, 0, 0.4);">
                <span>TIME:{filters.dateRange.toUpperCase()}</span>
                <button 
                  onClick={() => updateFilters({ dateRange: 'all' })}
                  class="text-[#ff6b35] hover:text-[#ff0000] transition-colors ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {filters.minEngagement > 0 && (
              <div class="terminal-filter-pill bg-[rgba(255,107,53,0.1)] border border-[#ff6b35] text-[#ff6b35] font-mono text-[9px] 
                          px-2 py-1 flex items-center gap-1 uppercase tracking-wide"
                   style="border-radius: 0; text-shadow: 0 0 4px rgba(255, 107, 53, 0.4);">
                <span>MIN_ENG:≥{filters.minEngagement}</span>
                <button 
                  onClick={() => updateFilters({ minEngagement: 0 })}
                  class="text-[#ff6b35] hover:text-[#ff0000] transition-colors ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terminal Animation Styles */}
      <style>{`
        /* Terminal cursor animation */
        @keyframes terminal-cursor {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .terminal-search:focus + div {
          animation: terminal-cursor 1s infinite;
        }

        /* Terminal glow animation */
        @keyframes terminal-glow {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 15px currentColor; }
        }

        .terminal-action-btn:hover {
          animation: terminal-glow 2s ease-in-out infinite;
        }

        /* Sweep effect for buttons */
        .terminal-action-btn::before,
        .terminal-add-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.3s ease;
        }

        .terminal-action-btn:hover::before,
        .terminal-add-btn:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default LibraryTableFilters;