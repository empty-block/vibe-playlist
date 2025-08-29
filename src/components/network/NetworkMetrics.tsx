import { Component, For, Show, createSignal, onMount } from 'solid-js';
import anime from 'animejs';

interface Metric {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
  description?: string;
}

interface TrendingItem {
  id: string;
  type: 'track' | 'artist' | 'curator';
  name: string;
  artist?: string;
  metric: string;
  trend: 'up' | 'down' | 'stable';
  avatar?: string;
}

interface NetworkMetricsProps {
  networkType: string;
}

const NetworkMetrics: Component<NetworkMetricsProps> = (props) => {
  const [animatedValues, setAnimatedValues] = createSignal<Record<string, number>>({});
  const [isLoading, setIsLoading] = createSignal(true);
  
  const metrics: Metric[] = [
    {
      label: 'Connected Users',
      value: 147,
      change: '+12',
      icon: 'fas fa-users',
      color: 'from-cyan-400 to-blue-400',
      description: 'Direct connections'
    },
    {
      label: 'Shared Tracks',
      value: '2.8K',
      change: '+24%',
      icon: 'fas fa-share-alt',
      color: 'from-green-400 to-cyan-400',
      description: 'This week'
    },
    {
      label: 'Network Reach',
      value: '48.3K',
      change: '+8%',
      icon: 'fas fa-network-wired',
      color: 'from-purple-400 to-pink-400',
      description: '2nd degree connections'
    },
    {
      label: 'Influence Score',
      value: 87,
      change: '+3',
      icon: 'fas fa-chart-line',
      color: 'from-pink-400 to-red-400',
      description: 'Network impact'
    }
  ];
  
  const trendingInNetwork: TrendingItem[] = [
    {
      id: '1',
      type: 'track',
      name: 'Midnight Dreams',
      artist: 'Luna Echo',
      metric: '847 shares',
      trend: 'up'
    },
    {
      id: '2',
      type: 'track',
      name: 'Digital Horizons',
      artist: 'Synthwave Collective',
      metric: '623 shares',
      trend: 'up'
    },
    {
      id: '3',
      type: 'artist',
      name: 'Crystal Castles',
      metric: '412 followers',
      trend: 'stable'
    },
    {
      id: '4',
      type: 'curator',
      name: 'ElectronicSoul',
      metric: '89% match',
      trend: 'up'
    },
    {
      id: '5',
      type: 'track',
      name: 'Neon Nights',
      artist: 'RetroWave',
      metric: '384 shares',
      trend: 'down'
    }
  ];
  
  const topConnections = [
    { name: 'MusicLover42', sharedTracks: 47, tasteMatch: 92 },
    { name: 'VinylCollector', sharedTracks: 38, tasteMatch: 87 },
    { name: 'BeatExplorer', sharedTracks: 32, tasteMatch: 84 },
    { name: 'SynthMaster', sharedTracks: 29, tasteMatch: 81 }
  ];
  
  onMount(() => {
    // Animate metric values
    setTimeout(() => {
      metrics.forEach((metric, index) => {
        if (typeof metric.value === 'number') {
          anime({
            targets: { val: 0 },
            val: metric.value,
            duration: 1500,
            delay: index * 100,
            easing: 'easeOutExpo',
            update: function(anim) {
              const target = anim.animations[0].currentValue;
              setAnimatedValues(prev => ({
                ...prev,
                [metric.label]: Math.round(target)
              }));
            }
          });
        }
      });
      setIsLoading(false);
    }, 300);
  });
  
  return (
    <div class="space-y-4">
      {/* Removed the key metrics grid - this was the 4 stat boxes causing issues */}
      
      {/* Two-column layout for desktop */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column */}
        <div class="space-y-4">
          {/* Trending in Network - Compact */}
          <div class="bg-black/40 border border-purple-400/20 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-purple-400 font-bold text-base flex items-center gap-2">
                <i class="fas fa-fire"></i>
                Trending in Your Network
              </h3>
              <span class="text-purple-400/60 font-mono text-xs animate-pulse">LIVE</span>
            </div>
            
            <div class="space-y-1.5">
              <For each={trendingInNetwork}>
                {(item) => (
                  <div class="bg-black/30 rounded p-2.5 hover:bg-purple-400/5 transition-all cursor-pointer group">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <div class={`w-6 h-6 rounded flex items-center justify-center ${
                          item.type === 'track' ? 'bg-gradient-to-br from-purple-400 to-pink-400' :
                          item.type === 'artist' ? 'bg-gradient-to-br from-cyan-400 to-blue-400' :
                          'bg-gradient-to-br from-green-400 to-cyan-400'
                        }`}>
                          <i class={`fas fa-${
                            item.type === 'track' ? 'music' :
                            item.type === 'artist' ? 'microphone' :
                            'user'
                          } text-white text-xs`}></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-white text-sm font-medium group-hover:text-purple-300 transition-colors truncate">
                            {item.name}
                          </p>
                          <Show when={item.artist}>
                            <p class="text-gray-400 text-xs truncate">{item.artist}</p>
                          </Show>
                        </div>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <p class="text-purple-400 font-mono text-xs font-bold">
                          {item.metric}
                        </p>
                        <div class="flex items-center justify-end gap-1">
                          <i class={`fas fa-arrow-${
                            item.trend === 'up' ? 'up text-green-400' :
                            item.trend === 'down' ? 'down text-red-400' :
                            'right text-gray-400'
                          } text-xs`}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
          
          {/* Network Activity Feed - Compact */}
          <div class="bg-black/40 border border-green-400/20 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-green-400 font-bold text-base flex items-center gap-2">
                <i class="fas fa-pulse"></i>
                Network Activity
              </h3>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-green-400/60 font-mono text-xs">LIVE</span>
              </div>
            </div>
            
            <div class="space-y-1.5 font-mono text-xs">
              <div class="text-green-400/80 hover:text-green-400 cursor-pointer transition-colors">
                <span class="text-green-400">[12:34]</span> MusicLover42 shared "Midnight Dreams"
              </div>
              <div class="text-cyan-400/80 hover:text-cyan-400 cursor-pointer transition-colors">
                <span class="text-cyan-400">[12:33]</span> New connection: BeatExplorer
              </div>
              <div class="text-purple-400/80 hover:text-purple-400 cursor-pointer transition-colors">
                <span class="text-purple-400">[12:32]</span> VinylCollector liked your playlist
              </div>
              <div class="text-pink-400/80 hover:text-pink-400 cursor-pointer transition-colors">
                <span class="text-pink-400">[12:30]</span> 5 users discovered your shares
              </div>
              <div class="text-yellow-400/80 hover:text-yellow-400 cursor-pointer transition-colors">
                <span class="text-yellow-400">[12:28]</span> Trending: "Digital Horizons" in your network
              </div>
            </div>
            
            <button class="w-full mt-3 py-1.5 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/30 rounded text-green-400 text-xs font-semibold hover:from-green-500/30 hover:to-cyan-500/30 transition-all">
              View Full Activity Log
            </button>
          </div>
        </div>
        
        {/* Right Column */}
        <div class="space-y-4">
          {/* Top Connections - Compact */}
          <div class="bg-black/40 border border-cyan-400/20 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-cyan-400 font-bold text-base flex items-center gap-2">
                <i class="fas fa-link"></i>
                Top Connections
              </h3>
              <button class="text-cyan-400/60 hover:text-cyan-400 transition-colors">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
            
            <div class="space-y-2.5">
              <For each={topConnections}>
                {(connection, index) => (
                  <div class="flex items-center justify-between hover:bg-cyan-400/5 rounded p-1 transition-all cursor-pointer">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-bold text-xs">{index() + 1}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-white font-medium text-sm truncate">{connection.name}</p>
                        <p class="text-cyan-300/60 text-xs">{connection.sharedTracks} tracks</p>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="flex items-center gap-2">
                        <div class="w-12 h-1 bg-black/60 rounded-full overflow-hidden">
                          <div 
                            class="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full transition-all duration-1000"
                            style={`width: ${connection.tasteMatch}%`}
                          />
                        </div>
                        <span class="text-cyan-400 font-mono text-xs w-8">{connection.tasteMatch}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
            
            <button class="w-full mt-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded text-cyan-400 text-xs font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 transition-all">
              Explore All Connections
            </button>
          </div>
          
          {/* Network Discovery - New Component */}
          <div class="bg-black/40 border border-pink-400/20 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-pink-400 font-bold text-base flex items-center gap-2">
                <i class="fas fa-compass"></i>
                Discovery Opportunities
              </h3>
              <button class="text-pink-400/60 hover:text-pink-400 transition-colors">
                <i class="fas fa-refresh"></i>
              </button>
            </div>
            
            <div class="space-y-2">
              <div class="bg-pink-400/10 border border-pink-400/20 rounded p-3 hover:bg-pink-400/15 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-pink-400 font-medium text-sm">Similar Taste Clusters</p>
                    <p class="text-pink-300/60 text-xs">23 users with 85%+ match</p>
                  </div>
                  <i class="fas fa-arrow-right text-pink-400/60"></i>
                </div>
              </div>
              
              <div class="bg-cyan-400/10 border border-cyan-400/20 rounded p-3 hover:bg-cyan-400/15 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-cyan-400 font-medium text-sm">Genre Bridges</p>
                    <p class="text-cyan-300/60 text-xs">Discover cross-genre connections</p>
                  </div>
                  <i class="fas fa-arrow-right text-cyan-400/60"></i>
                </div>
              </div>
              
              <div class="bg-green-400/10 border border-green-400/20 rounded p-3 hover:bg-green-400/15 transition-all cursor-pointer">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-green-400 font-medium text-sm">Emerging Communities</p>
                    <p class="text-green-300/60 text-xs">4 new micro-communities forming</p>
                  </div>
                  <i class="fas fa-arrow-right text-green-400/60"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMetrics;