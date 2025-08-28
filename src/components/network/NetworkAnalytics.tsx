import { Component, For, Show } from 'solid-js';

interface NetworkStat {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}

interface NetworkAnalyticsProps {
  isLoading: boolean;
}

const NetworkAnalytics: Component<NetworkAnalyticsProps> = (props) => {
  const networkStats: NetworkStat[] = [
    {
      label: 'Active Curators',
      value: '2,847',
      change: '+12%',
      icon: 'fas fa-users',
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Network Reach',
      value: '48.3K',
      change: '+24%',
      icon: 'fas fa-network-wired',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      label: 'Shared Tracks',
      value: '156K',
      change: '+8%',
      icon: 'fas fa-music',
      color: 'from-green-500 to-cyan-500'
    },
    {
      label: 'Taste Match',
      value: '87%',
      change: '+3%',
      icon: 'fas fa-heart',
      color: 'from-pink-500 to-red-500'
    }
  ];

  return (
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-6">
        <i class="fas fa-chart-network text-purple-400 text-xl"></i>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Network Intelligence
        </h2>
        <div class="flex-1 border-b border-purple-400/20"></div>
        <span class="text-purple-400/60 font-mono text-sm">LIVE</span>
        <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
      </div>

      <Show
        when={!props.isLoading}
        fallback={
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <For each={[1, 2, 3, 4]}>
              {() => (
                <div class="bg-slate-800/60 rounded-xl p-4 animate-pulse">
                  <div class="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div class="h-8 bg-slate-700 rounded w-1/2"></div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <For each={networkStats}>
            {(stat) => (
              <div class="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-purple-400/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300 group">
                <div class="flex items-start justify-between mb-2">
                  <div class={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <i class={`${stat.icon} text-white`}></i>
                  </div>
                  <Show when={stat.change}>
                    <span class="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  </Show>
                </div>
                <div class="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div class="text-sm text-purple-300/70">
                  {stat.label}
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Additional Network Insights */}
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-cyan-400/20 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-fire text-orange-400"></i>
              <h3 class="text-cyan-300 font-semibold">Hot in Your Network</h3>
            </div>
            <div class="space-y-2">
              <For each={['Electronic', 'Indie Rock', 'Hip Hop']}>
                {(genre) => (
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-cyan-200/70">{genre}</span>
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-400" style={`width: ${Math.random() * 50 + 50}%`}></div>
                      </div>
                      <span class="text-cyan-400 font-mono text-xs">
                        {Math.floor(Math.random() * 30 + 70)}%
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-pink-400/20 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-users text-pink-400"></i>
              <h3 class="text-pink-300 font-semibold">Community Growth</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-pink-200/70">New Connections</span>
                <span class="text-pink-400 font-mono">+147 this week</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-pink-200/70">Mutual Follows</span>
                <span class="text-pink-400 font-mono">892 total</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-pink-200/70">Discovery Score</span>
                <span class="text-green-400 font-mono">↑ 92/100</span>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default NetworkAnalytics;