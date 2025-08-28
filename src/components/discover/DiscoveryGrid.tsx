import { Component, For, Show, createSignal } from 'solid-js';
import { TrendingTrack, FreshTrack } from '../../types/discover';

interface DiscoveryModule {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  count?: number;
  items: any[];
  type: 'artist' | 'release' | 'deepcut' | 'label' | 'tag' | 'queue';
}

interface DiscoveryGridProps {
  isLoading: boolean;
  trendingTracks?: TrendingTrack[];
  freshTracks?: FreshTrack[];
}

const DiscoveryGrid: Component<DiscoveryGridProps> = (props) => {
  const [selectedModule, setSelectedModule] = createSignal<string | null>(null);

  const modules: DiscoveryModule[] = [
    {
      id: 'artist-spotlight',
      title: 'Artist Spotlight',
      subtitle: 'Rising talents & established favorites',
      icon: 'fas fa-microphone-alt',
      color: 'from-purple-500 to-pink-500',
      count: 24,
      type: 'artist',
      items: [
        { name: 'Fred again..', tracks: 42, genre: 'Electronic', momentum: '+85%', image: '🎧' },
        { name: 'Caroline Polachek', tracks: 38, genre: 'Pop', momentum: '+62%', image: '🎤' },
        { name: 'Arca', tracks: 51, genre: 'Experimental', momentum: '+73%', image: '🎹' }
      ]
    },
    {
      id: 'release-radar',
      title: 'Release Radar',
      subtitle: 'Fresh drops from the last 7 days',
      icon: 'fas fa-compact-disc',
      color: 'from-green-500 to-cyan-500',
      count: 48,
      type: 'release',
      items: props.freshTracks?.slice(0, 3) || [
        { title: 'New Track', artist: 'Artist 1', releaseDate: 'Today', plays: '1.2K' },
        { title: 'Latest Single', artist: 'Artist 2', releaseDate: 'Yesterday', plays: '892' },
        { title: 'Fresh Drop', artist: 'Artist 3', releaseDate: '2 days ago', plays: '654' }
      ]
    },
    {
      id: 'deep-cuts',
      title: 'Deep Cuts',
      subtitle: 'Hidden gems worth discovering',
      icon: 'fas fa-gem',
      color: 'from-indigo-500 to-purple-500',
      count: 127,
      type: 'deepcut',
      items: [
        { title: 'Obscure Track 1', artist: 'Underground Artist', year: '2019', plays: '234' },
        { title: 'Hidden Gem 2', artist: 'Rare Find', year: '2020', plays: '189' },
        { title: 'Deep Cut 3', artist: 'Forgotten Name', year: '2018', plays: '412' }
      ]
    },
    {
      id: 'label-showcase',
      title: 'Label Showcase',
      subtitle: 'Curated label collections',
      icon: 'fas fa-record-vinyl',
      color: 'from-orange-500 to-red-500',
      count: 15,
      type: 'label',
      items: [
        { name: 'Hyperdub', releases: 234, founded: '2004', style: 'Electronic/Dubstep' },
        { name: 'Warp Records', releases: 567, founded: '1989', style: 'Electronic/IDM' },
        { name: 'Ghostly International', releases: 412, founded: '1999', style: 'Electronic/Indie' }
      ]
    },
    {
      id: 'tag-cloud',
      title: 'Tag Explorer',
      subtitle: 'Trending tags & moods',
      icon: 'fas fa-hashtag',
      color: 'from-cyan-500 to-blue-500',
      count: 89,
      type: 'tag',
      items: [
        { tag: 'synthwave', count: 1234, trend: 'rising' },
        { tag: 'late-night', count: 892, trend: 'stable' },
        { tag: 'study-vibes', count: 2341, trend: 'rising' },
        { tag: 'nostalgic', count: 567, trend: 'rising' }
      ]
    },
    {
      id: 'discovery-queue',
      title: 'Discovery Queue',
      subtitle: 'AI-curated based on your taste',
      icon: 'fas fa-brain',
      color: 'from-pink-500 to-purple-500',
      count: 32,
      type: 'queue',
      items: props.trendingTracks?.slice(0, 3) || [
        { title: 'Recommended 1', artist: 'Based on your likes', match: '92%' },
        { title: 'Suggested 2', artist: 'Similar to your playlist', match: '87%' },
        { title: 'You might like 3', artist: 'Network favorite', match: '84%' }
      ]
    }
  ];

  const renderModuleContent = (module: DiscoveryModule) => {
    switch (module.type) {
      case 'artist':
        return (
          <div class="space-y-2 mt-3">
            <For each={module.items.slice(0, 3)}>
              {(artist) => (
                <div class="flex items-center justify-between p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors cursor-pointer">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg">
                      {artist.image}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">{artist.name}</div>
                      <div class="text-xs text-gray-400">{artist.genre} • {artist.tracks} tracks</div>
                    </div>
                  </div>
                  <span class="text-xs font-mono text-green-400">{artist.momentum}</span>
                </div>
              )}
            </For>
          </div>
        );
      
      case 'release':
        return (
          <div class="space-y-2 mt-3">
            <For each={module.items.slice(0, 3)}>
              {(release) => (
                <div class="flex items-center justify-between p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors cursor-pointer">
                  <div>
                    <div class="text-sm font-semibold text-white truncate">{release.title || release.name}</div>
                    <div class="text-xs text-gray-400">{release.artist} • {release.releaseDate || 'New'}</div>
                  </div>
                  <span class="text-xs font-mono text-cyan-400">{release.plays || '0'} plays</span>
                </div>
              )}
            </For>
          </div>
        );
        
      case 'tag':
        return (
          <div class="flex flex-wrap gap-2 mt-3">
            <For each={module.items}>
              {(item) => (
                <button class="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-full text-xs text-cyan-300 hover:border-cyan-400 transition-all">
                  #{item.tag} <span class="text-cyan-400/70">({item.count})</span>
                </button>
              )}
            </For>
          </div>
        );
        
      case 'label':
        return (
          <div class="space-y-2 mt-3">
            <For each={module.items.slice(0, 2)}>
              {(label) => (
                <div class="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors cursor-pointer">
                  <div class="text-sm font-semibold text-white">{label.name}</div>
                  <div class="text-xs text-gray-400">{label.style} • {label.releases} releases</div>
                </div>
              )}
            </For>
          </div>
        );
        
      default:
        return (
          <div class="space-y-2 mt-3">
            <For each={module.items.slice(0, 3)}>
              {(item) => (
                <div class="p-2 bg-black/30 rounded-lg text-xs text-gray-300">
                  <div class="font-semibold">{item.title || item.name}</div>
                  <div class="text-gray-400">{item.artist || item.description || 'Loading...'}</div>
                </div>
              )}
            </For>
          </div>
        );
    }
  };

  return (
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-6">
        <i class="fas fa-grid text-green-400 text-xl"></i>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          Discovery Modules
        </h2>
        <div class="flex-1 border-b border-green-400/20"></div>
        <span class="text-green-400/60 font-mono text-sm">6 ACTIVE</span>
      </div>

      <Show
        when={!props.isLoading}
        fallback={
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={[1, 2, 3, 4, 5, 6]}>
              {() => (
                <div class="bg-slate-800/60 rounded-xl p-6 animate-pulse">
                  <div class="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div class="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                  <div class="space-y-2">
                    <div class="h-12 bg-slate-700 rounded"></div>
                    <div class="h-12 bg-slate-700 rounded"></div>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={modules}>
            {(module) => (
              <div 
                class="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-green-400/20 rounded-xl p-4 hover:border-green-400/40 transition-all duration-300 cursor-pointer group"
                classList={{
                  'border-green-400 shadow-lg shadow-green-400/20': selectedModule() === module.id
                }}
                onClick={() => setSelectedModule(module.id === selectedModule() ? null : module.id)}
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class={`w-10 h-10 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <i class={`${module.icon} text-white`}></i>
                    </div>
                    <div>
                      <h3 class="font-bold text-white">{module.title}</h3>
                      <p class="text-xs text-gray-400">{module.subtitle}</p>
                    </div>
                  </div>
                  <Show when={module.count}>
                    <span class="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      {module.count}
                    </span>
                  </Show>
                </div>

                {renderModuleContent(module)}

                <div class="mt-3 pt-3 border-t border-gray-700/50">
                  <button class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                    <span>View All</span>
                    <i class="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default DiscoveryGrid;