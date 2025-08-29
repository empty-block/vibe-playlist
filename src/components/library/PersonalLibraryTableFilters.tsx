import { Component, createSignal } from 'solid-js';
import { PersonalFilterType, PersonalTrack } from './PersonalLibraryTable';

interface PersonalLibraryTableFiltersProps {
  currentFilter: PersonalFilterType;
  onFilterChange: (filter: PersonalFilterType) => void;
  tracks: PersonalTrack[];
}

const PersonalLibraryTableFilters: Component<PersonalLibraryTableFiltersProps> = (props) => {
  const [searchInput, setSearchInput] = createSignal('');

  // Calculate stats for each filter
  const getFilterStats = () => {
    const allTracks = props.tracks || [];
    return {
      all: allTracks.length,
      shared: allTracks.filter(t => t.userInteraction.type === 'shared').length,
      liked: allTracks.filter(t => t.userInteraction.type === 'liked').length,
      conversations: allTracks.filter(t => t.userInteraction.type === 'conversation').length,
      recasts: allTracks.filter(t => t.userInteraction.type === 'recast').length,
    };
  };

  const stats = getFilterStats();

  return (
    <div class="personal-filter-bar bg-[#0d0d0d] border-2 border-[#04caf4]/20 p-4" style="box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);">
      {/* Activity Dropdown Filters */}
      <div class="flex items-center justify-between gap-6 min-w-max">
        {/* Activity Filter */}
        <div class="flex items-center gap-2">
          <label class="text-[#f906d6] text-xs font-mono uppercase tracking-wider" style="font-family: 'JetBrains Mono', monospace;">
            ACTIVITY:
          </label>
          <select
            value={props.currentFilter}
            onChange={(e) => props.onFilterChange(e.currentTarget.value as PersonalFilterType)}
            class="px-3 py-2 bg-[#f906d6]/10 border border-[#f906d6] text-[#f906d6] text-xs font-mono uppercase tracking-wider focus:outline-none"
            style="font-family: 'JetBrains Mono', monospace;"
          >
            <option value="all">ALL ({stats.all})</option>
            <option value="shared">SHARED ({stats.shared})</option>
            <option value="liked">LIKED ({stats.liked})</option>
            <option value="conversations">CONVERSATIONS ({stats.conversations})</option>
          </select>
        </div>
        
        {/* Search Input */}
        <div class="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="SEARCH_QUERY > "
            value={searchInput()}
            onInput={(e) => setSearchInput(e.currentTarget.value)}
            class="flex-1 bg-[#04caf4]/10 border border-[#04caf4] text-[#04caf4] px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none placeholder-[#04caf4]/50"
            style="font-family: 'JetBrains Mono', monospace;"
          />
        </div>

        {/* Status Display */}
        <div class="text-[#04caf4]/70 text-xs font-mono uppercase tracking-wider" style="font-family: 'JetBrains Mono', monospace;">
          SHOWING: {
            props.currentFilter === 'shared' ? `SHARED (${stats.shared})` :
            props.currentFilter === 'liked' ? `LIKED (${stats.liked})` :
            props.currentFilter === 'conversations' ? `CONVERSATIONS (${stats.conversations})` :
            `ALL_ACTIVITY (${stats.all})`
          }
        </div>
      </div>
    </div>
  );
};

export default PersonalLibraryTableFilters;