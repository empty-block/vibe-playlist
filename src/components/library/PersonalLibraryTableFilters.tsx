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

  const getFilterIcon = (filter: PersonalFilterType) => {
    switch (filter) {
      case 'shared': return '🎵';
      case 'liked': return '💖';
      case 'conversations': return '💬';
      case 'recasts': return '🔄';
      case 'all': return '📊';
      default: return '📝';
    }
  };

  const getFilterLabel = (filter: PersonalFilterType) => {
    switch (filter) {
      case 'shared': return 'Shared';
      case 'liked': return 'Liked';
      case 'conversations': return 'Conversations';
      case 'recasts': return 'Recasts';
      case 'all': return 'All Activity';
      default: return 'All';
    }
  };

  const getFilterColor = (filter: PersonalFilterType, isActive: boolean) => {
    const baseClass = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2';
    
    if (isActive) {
      switch (filter) {
        case 'shared':
          return `${baseClass} bg-gradient-to-r from-pink-400 to-purple-400 text-white`;
        case 'liked':
          return `${baseClass} bg-gradient-to-r from-red-400 to-pink-400 text-white`;
        case 'conversations':
          return `${baseClass} bg-gradient-to-r from-blue-400 to-cyan-400 text-white`;
        case 'recasts':
          return `${baseClass} bg-gradient-to-r from-green-400 to-emerald-400 text-white`;
        case 'all':
          return `${baseClass} bg-gradient-to-r from-cyan-400 to-blue-400 text-white`;
        default:
          return `${baseClass} bg-gradient-to-r from-cyan-400 to-blue-400 text-white`;
      }
    } else {
      return `${baseClass} bg-white/10 text-white/60 border border-white/20 hover:bg-white/20 hover:text-white hover:border-white/30`;
    }
  };

  const stats = getFilterStats();

  return (
    <div class="personal-filter-bar bg-gradient-to-r from-slate-900 to-slate-800 border-b border-pink-400/20 p-4">
      {/* Personal Filter Buttons */}
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => props.onFilterChange('all')}
          class={getFilterColor('all', props.currentFilter === 'all')}
        >
          <span class="text-lg">{getFilterIcon('all')}</span>
          <span>{getFilterLabel('all')}</span>
          <span class="bg-white/20 text-xs px-2 py-1 rounded-full ml-1">
            {stats.all}
          </span>
        </button>

        <button
          onClick={() => props.onFilterChange('shared')}
          class={getFilterColor('shared', props.currentFilter === 'shared')}
        >
          <span class="text-lg">{getFilterIcon('shared')}</span>
          <span>{getFilterLabel('shared')}</span>
          <span class="bg-white/20 text-xs px-2 py-1 rounded-full ml-1">
            {stats.shared}
          </span>
        </button>

        <button
          onClick={() => props.onFilterChange('liked')}
          class={getFilterColor('liked', props.currentFilter === 'liked')}
        >
          <span class="text-lg">{getFilterIcon('liked')}</span>
          <span>{getFilterLabel('liked')}</span>
          <span class="bg-white/20 text-xs px-2 py-1 rounded-full ml-1">
            {stats.liked}
          </span>
        </button>

        <button
          onClick={() => props.onFilterChange('conversations')}
          class={getFilterColor('conversations', props.currentFilter === 'conversations')}
        >
          <span class="text-lg">{getFilterIcon('conversations')}</span>
          <span>{getFilterLabel('conversations')}</span>
          <span class="bg-white/20 text-xs px-2 py-1 rounded-full ml-1">
            {stats.conversations}
          </span>
        </button>

        {stats.recasts > 0 && (
          <button
            onClick={() => props.onFilterChange('recasts')}
            class={getFilterColor('recasts', props.currentFilter === 'recasts')}
          >
            <span class="text-lg">{getFilterIcon('recasts')}</span>
            <span>{getFilterLabel('recasts')}</span>
            <span class="bg-white/20 text-xs px-2 py-1 rounded-full ml-1">
              {stats.recasts}
            </span>
          </button>
        )}
      </div>

      {/* Search Input for Personal Library */}
      <div class="flex items-center gap-4">
        <div class="flex-grow min-w-[250px] max-w-[400px]">
          <input
            type="text"
            placeholder="Search your music activity..."
            value={searchInput()}
            onInput={(e) => setSearchInput(e.target.value)}
            class="search-input w-full bg-slate-800/80 border border-pink-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder:text-pink-400/50 focus:outline-none focus:border-pink-400 focus:shadow-lg focus:shadow-pink-400/20 transition-all"
          />
        </div>

        {/* Current Filter Display */}
        <div class="text-sm text-white/60">
          Showing <span class="text-pink-400 font-semibold">{getFilterLabel(props.currentFilter)}</span>
          {props.currentFilter !== 'all' && (
            <span class="text-white/40"> • {
              props.currentFilter === 'shared' ? stats.shared :
              props.currentFilter === 'liked' ? stats.liked :
              props.currentFilter === 'conversations' ? stats.conversations :
              props.currentFilter === 'recasts' ? stats.recasts : stats.all
            } tracks</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalLibraryTableFilters;