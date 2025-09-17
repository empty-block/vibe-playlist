import { Component, createSignal, onCleanup, Show } from 'solid-js';
import { filters, updateFilters, resetFilters, FilterPlatform, filteredTracks } from '../../stores/libraryStore';

// Import types for profile mode
export interface PersonalTrack {
  id: string;
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
  // ... other track properties
}

export type PersonalFilterType = 'all' | 'shared' | 'liked' | 'conversations' | 'recasts';

interface LibraryTableFiltersProps {
  profileMode?: boolean;
  personalFilter?: PersonalFilterType;
  onPersonalFilterChange?: (filter: PersonalFilterType) => void;
  personalTracks?: PersonalTrack[];
}

const LibraryTableFilters: Component<LibraryTableFiltersProps> = (props) => {
  const [searchInput, setSearchInput] = createSignal(filters.search);
  const [showFilters, setShowFilters] = createSignal(false);
  let searchTimeout: any;
  let filterContainerRef: HTMLDivElement | undefined;

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

  // Smart auto-expansion logic
  const shouldAutoExpand = () => {
    return filters.platform !== 'all' || 
           filters.dateRange !== 'all' || 
           filters.minEngagement > 0 ||
           filteredTracks().length < 50; // Show filters if result set is small
  };

  // Toggle filters with animation
  const toggleFilters = () => {
    const newShowFilters = !showFilters();
    setShowFilters(newShowFilters);
    
    if (filterContainerRef && typeof window !== 'undefined') {
      if (newShowFilters) {
        // Expand animation
        filterContainerRef.style.height = '0px';
        filterContainerRef.style.opacity = '0';
        setTimeout(() => {
          if (filterContainerRef) {
            filterContainerRef.style.height = filterContainerRef.scrollHeight + 'px';
            filterContainerRef.style.opacity = '1';
          }
        }, 10);
      } else {
        // Collapse animation
        filterContainerRef.style.height = filterContainerRef.scrollHeight + 'px';
        setTimeout(() => {
          if (filterContainerRef) {
            filterContainerRef.style.height = '0px';
            filterContainerRef.style.opacity = '0';
          }
        }, 10);
      }
    }
  };

  // Calculate personal stats for profile mode
  const getPersonalStats = () => {
    if (!props.profileMode || !props.personalTracks) {
      return { all: 0, shared: 0, liked: 0, conversations: 0, recasts: 0 };
    }
    
    const tracks = props.personalTracks;
    return {
      all: tracks.length,
      shared: tracks.filter(t => t.userInteraction.type === 'shared').length,
      liked: tracks.filter(t => t.userInteraction.type === 'liked').length,
      conversations: tracks.filter(t => t.userInteraction.type === 'conversation').length,
      recasts: tracks.filter(t => t.userInteraction.type === 'recast').length,
    };
  };

  // Auto-expand when filters are active
  const hasActiveFilters = () => {
    const baseFilters = filters.search || 
           filters.platform !== 'all' || 
           filters.dateRange !== 'all' || 
           filters.minEngagement > 0;
    
    const personalFilter = props.profileMode && props.personalFilter && props.personalFilter !== 'all';
    
    return baseFilters || personalFilter;
  };

  // Auto-expand effect
  if (shouldAutoExpand() && !showFilters() && hasActiveFilters()) {
    setShowFilters(true);
  }

  onCleanup(() => {
    clearTimeout(searchTimeout);
  });

  return (
    <div class="terminal-query-interface bg-[#0d0d0d] border-2 border-[#04caf4]/20 font-mono">

      <div class="p-4">
        {/* Main Row Layout - Search Input with Buttons */}
        <div class="flex items-center gap-3 flex-wrap">
          {/* Search Input - Takes most space */}
          <div class="flex-1 min-w-[200px] relative">
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

          {/* Action Buttons - Now on same row as search */}
          <div class="flex items-center gap-2">
            {/* Show Filters Toggle */}
            <button
              onClick={toggleFilters}
              class={`text-[10px] font-mono uppercase tracking-wider transition-all duration-200 px-3 py-2.5 border
                     ${showFilters() 
                       ? 'text-[#f906d6] border-[#f906d6]/50 bg-[rgba(249,6,214,0.1)] hover:text-[#f906d6]/80' 
                       : 'text-[#04caf4]/60 border-[#04caf4]/30 bg-[rgba(4,202,244,0.05)] hover:text-[#04caf4]'}`}
              style="border-radius: 0;"
            >
              SHOW FILTERS
              {hasActiveFilters() && !showFilters() && (
                <span class="ml-1 text-[#00f92a] animate-pulse">●</span>
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              class="terminal-action-btn bg-[rgba(255,155,0,0.1)] border border-[#ff9b00] text-[#ff9b00] font-mono text-[10px] 
                     px-3 py-2.5 uppercase tracking-wider font-bold transition-all duration-200 relative overflow-hidden
                     hover:bg-[rgba(255,155,0,0.2)] hover:shadow-[0_0_10px_rgba(255,155,0,0.3)]"
              style="border-radius: 0; text-shadow: 0 0 6px rgba(255, 155, 0, 0.4);"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        <Show when={showFilters()}>
          <div 
            ref={filterContainerRef}
            class="filter-container overflow-hidden transition-all duration-300 ease-out mt-3 border-t border-[#04caf4]/20 pt-3"
          >
            {/* Advanced Filter Controls */}
            <div class="flex flex-wrap items-center gap-3 mb-3">
              {/* Platform Dropdown */}
              <div class="relative">
                <label class="text-[#04caf4] font-mono text-[8px] uppercase tracking-wide block mb-1 opacity-70">
                  PLATFORM
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) => handlePlatformChange(e.target.value as FilterPlatform)}
                  class="terminal-select bg-[rgba(0,0,0,0.9)] border border-[#04caf4] text-[#04caf4] font-mono text-[10px] 
                         px-3 py-2 min-w-[120px] uppercase tracking-wide cursor-pointer transition-all duration-200
                         hover:border-[#04caf4] hover:shadow-[0_0_8px_rgba(4,202,244,0.2)]
                         focus:outline-none focus:shadow-[0_0_12px_rgba(4,202,244,0.3)]"
                  style="border-radius: 0; text-shadow: 0 0 6px rgba(4, 202, 244, 0.4);"
                >
                  <option value="all" class="bg-[#0d0d0d] text-[#04caf4]">ALL PLATFORMS</option>
                  <option value="youtube" class="bg-[#0d0d0d] text-[#04caf4]">YOUTUBE</option>
                  <option value="spotify" class="bg-[#0d0d0d] text-[#04caf4]">SPOTIFY</option>
                  <option value="soundcloud" class="bg-[#0d0d0d] text-[#04caf4]">SOUNDCLOUD</option>
                  <option value="bandcamp" class="bg-[#0d0d0d] text-[#04caf4]">BANDCAMP</option>
                </select>
              </div>

              {/* Time Period Dropdown */}
              <div class="relative">
                <label class="text-[#ffff00] font-mono text-[8px] uppercase tracking-wide block mb-1 opacity-70">
                  TIME PERIOD
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as 'all' | 'today' | 'week' | 'month')}
                  class="terminal-select bg-[rgba(0,0,0,0.9)] border border-[#ffff00] text-[#ffff00] font-mono text-[10px] 
                         px-3 py-2 min-w-[110px] uppercase cursor-pointer transition-all duration-200
                         hover:shadow-[0_0_8px_rgba(255,255,0,0.2)]
                         focus:outline-none focus:shadow-[0_0_12px_rgba(255,255,0,0.3)]"
                  style="border-radius: 0; text-shadow: 0 0 6px rgba(255, 255, 0, 0.4);"
                >
                  <option value="all" class="bg-[#0d0d0d] text-[#ffff00]">ALL TIME</option>
                  <option value="today" class="bg-[#0d0d0d] text-[#ffff00]">TODAY</option>
                  <option value="week" class="bg-[#0d0d0d] text-[#ffff00]">THIS WEEK</option>
                  <option value="month" class="bg-[#0d0d0d] text-[#ffff00]">THIS MONTH</option>
                </select>
              </div>

              {/* Min Engagement Input */}
              <div class="flex flex-col">
                <label class="text-[#e010e0] font-mono text-[8px] uppercase tracking-wide block mb-1 opacity-70">
                  MIN ENGAGEMENT
                </label>
                <div class="flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={filters.minEngagement}
                    onChange={(e) => handleEngagementChange(parseInt(e.target.value) || 0)}
                    class="terminal-input bg-[rgba(0,0,0,0.9)] border border-[#e010e0] text-[#e010e0] font-mono text-[10px] 
                           px-3 py-2 w-20 text-center uppercase cursor-pointer transition-all duration-200
                           hover:shadow-[0_0_8px_rgba(224,16,224,0.2)]
                           focus:outline-none focus:shadow-[0_0_12px_rgba(224,16,224,0.3)]"
                    placeholder="0"
                    style="border-radius: 0; text-shadow: 0 0 6px rgba(224, 16, 224, 0.4);"
                  />
                </div>
              </div>

              {/* Activity Filter - Only show in profile mode */}
              <Show when={props.profileMode}>
                <div class="relative">
                  <select
                    value={props.personalFilter || 'all'}
                    onChange={(e) => props.onPersonalFilterChange?.(e.target.value as PersonalFilterType)}
                    class="terminal-select bg-[rgba(0,0,0,0.9)] border border-[#f906d6] text-[#f906d6] font-mono text-[10px] 
                           px-3 py-2 min-w-[120px] uppercase tracking-wide cursor-pointer transition-all duration-200
                           hover:border-[#f906d6] hover:shadow-[0_0_8px_rgba(249,6,214,0.2)]
                           focus:outline-none focus:shadow-[0_0_12px_rgba(249,6,214,0.3)]"
                    style="border-radius: 0; text-shadow: 0 0 6px rgba(249, 6, 214, 0.4);"
                  >
                    <option value="all" class="bg-[#0d0d0d] text-[#f906d6]">ACTIVITY_ALL ({getPersonalStats().all})</option>
                    <option value="shared" class="bg-[#0d0d0d] text-[#f906d6]">ACTIVITY_SHARED ({getPersonalStats().shared})</option>
                    <option value="liked" class="bg-[#0d0d0d] text-[#f906d6]">ACTIVITY_LIKED ({getPersonalStats().liked})</option>
                    <option value="conversations" class="bg-[#0d0d0d] text-[#f906d6]">ACTIVITY_CONVERSATIONS ({getPersonalStats().conversations})</option>
                    <option value="recasts" class="bg-[#0d0d0d] text-[#f906d6]">ACTIVITY_RECASTS ({getPersonalStats().recasts})</option>
                  </select>
                </div>
              </Show>
            </div>
          </div>
        </Show>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
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
                  class="text-[#e010e0] hover:text-[#ff0000] transition-colors ml-1 font-bold"
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
                  class="text-[#e010e0] hover:text-[#ff0000] transition-colors ml-1 font-bold"
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
                  class="text-[#e010e0] hover:text-[#ff0000] transition-colors ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {filters.minEngagement > 0 && (
              <div class="terminal-filter-pill bg-[rgba(224,16,224,0.1)] border border-[#e010e0] text-[#e010e0] font-mono text-[9px] 
                          px-2 py-1 flex items-center gap-1 uppercase tracking-wide"
                   style="border-radius: 0; text-shadow: 0 0 4px rgba(224, 16, 224, 0.4);">
                <span>MIN_ENG:≥{filters.minEngagement}</span>
                <button 
                  onClick={() => updateFilters({ minEngagement: 0 })}
                  class="text-[#e010e0] hover:text-[#ff0000] transition-colors ml-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

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

        /* Filter container animation */
        .filter-container {
          transition: height 0.3s ease-out, opacity 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LibraryTableFilters;