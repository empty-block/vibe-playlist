import { Component, For, Show } from 'solid-js';
import { CuratorProfile } from '../../types/discover';

interface CuratorSpotlightsProps {
  curators: CuratorProfile[];
  isLoading: boolean;
}

const CuratorSpotlights: Component<CuratorSpotlightsProps> = (props) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div class="discover-section curator-spotlights mb-8">
      <div class="retro-music-terminal bg-gradient-to-b from-slate-900/60 to-black/60 border-2 border-pink-400/30 rounded-xl p-6">
        <div class="section-header mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="retro-section-title flex items-center gap-3 text-2xl font-bold text-white mb-2">
                <i class="fas fa-star text-pink-400"></i>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  Curator Spotlights
                </span>
              </h2>
              <p class="retro-section-subtitle text-pink-300/70 text-sm font-mono">
                Tastemakers worth following
              </p>
            </div>
            <div class="text-pink-400/60 text-xs font-mono">
              Featured curators
            </div>
          </div>
        </div>

        <Show
          when={!props.isLoading}
          fallback={
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={[1, 2, 3]}>
                {() => (
                  <div class="curator-card-skeleton animate-pulse">
                    <div class="p-6 bg-slate-800/40 rounded-lg border border-pink-400/10">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 bg-pink-400/20 rounded-full"></div>
                        <div class="flex-1 space-y-2">
                          <div class="h-4 bg-pink-400/20 rounded w-3/4"></div>
                          <div class="h-3 bg-pink-400/20 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div class="space-y-3">
                        <div class="h-12 bg-pink-400/20 rounded"></div>
                        <div class="h-12 bg-pink-400/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <div class="curator-grid">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={props.curators}>
                {(curator) => (
                  <div class="curator-card group">
                    <div class="curator-card-content p-6 bg-gradient-to-b from-slate-800/60 to-slate-700/40 hover:from-slate-700/80 hover:to-slate-600/60 rounded-lg border border-pink-400/20 hover:border-pink-400/40 transition-all duration-300 cursor-pointer h-full">
                      
                      {/* Curator Header */}
                      <div class="curator-header flex items-center gap-4 mb-4">
                        <div class="curator-avatar-container relative">
                          <img 
                            src={curator.avatar} 
                            alt={curator.displayName}
                            class="w-16 h-16 rounded-full border-2 border-pink-400/40 shadow-lg shadow-pink-400/20 object-cover group-hover:border-pink-400/60 transition-colors duration-300"
                          />
                          <div class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <i class="fas fa-crown text-white text-xs"></i>
                          </div>
                        </div>

                        <div class="curator-info flex-1 min-w-0">
                          <div class="curator-name text-white font-semibold text-lg truncate group-hover:text-pink-300 transition-colors duration-300">
                            {curator.displayName}
                          </div>
                          <div class="curator-username text-pink-300/80 text-sm font-mono truncate">
                            @{curator.username}
                          </div>
                          <div class="curator-score flex items-center gap-2 mt-1">
                            <div class="flex items-center gap-1 text-xs">
                              <div class="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"></div>
                              <span class="text-pink-400 font-mono">{curator.curationScore}% match</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Curator Stats */}
                      <div class="curator-stats grid grid-cols-3 gap-4 mb-4 p-3 bg-pink-400/5 border border-pink-400/20 rounded-lg">
                        <div class="text-center">
                          <div class="text-pink-400 font-bold text-lg font-mono">
                            {formatNumber(curator.followerCount)}
                          </div>
                          <div class="text-pink-300/60 text-xs font-mono">
                            followers
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-pink-400 font-bold text-lg font-mono">
                            {curator.trackCount}
                          </div>
                          <div class="text-pink-300/60 text-xs font-mono">
                            tracks
                          </div>
                        </div>
                        <div class="text-center">
                          <div class="text-pink-400 font-bold text-lg font-mono">
                            {curator.curationScore}
                          </div>
                          <div class="text-pink-300/60 text-xs font-mono">
                            score
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <Show when={curator.bio}>
                        <div class="curator-bio mb-4">
                          <p class="text-pink-200/80 text-sm italic leading-relaxed">
                            {curator.bio}
                          </p>
                        </div>
                      </Show>

                      {/* Sample Tracks */}
                      <div class="curator-recent-tracks">
                        <div class="text-pink-300/80 text-sm font-mono mb-3">
                          Recent picks:
                        </div>
                        <div class="space-y-2">
                          <For each={curator.sampleTracks.slice(0, 2)}>
                            {(track) => (
                              <div class="mini-track-preview group/track">
                                <div class="flex items-center gap-3 p-2 bg-pink-400/5 hover:bg-pink-400/10 rounded border border-pink-400/10 hover:border-pink-400/20 transition-all duration-200 cursor-pointer">
                                  <img 
                                    src={track.thumbnail} 
                                    alt={track.title}
                                    class="w-8 h-8 rounded object-cover border border-pink-400/20"
                                  />
                                  <div class="flex-1 min-w-0">
                                    <div class="track-title text-pink-200 text-sm font-medium truncate group-hover/track:text-pink-100 transition-colors duration-200">
                                      {track.title}
                                    </div>
                                    <div class="track-artist text-pink-300/70 text-xs truncate">
                                      {track.artist}
                                    </div>
                                  </div>
                                  <div class="flex items-center gap-1 opacity-0 group-hover/track:opacity-100 transition-opacity duration-200">
                                    <button class="w-6 h-6 rounded-full bg-pink-500/20 hover:bg-pink-500/30 flex items-center justify-center text-pink-400">
                                      <i class="fas fa-play text-xs"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <div class="curator-actions mt-6 pt-4 border-t border-pink-400/20">
                        <button class="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                          <i class="fas fa-user-plus mr-2"></i>
                          Follow Curator
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>

            {/* Browse More Curators */}
            <div class="text-center mt-8">
              <button class="px-6 py-3 text-pink-400 hover:text-pink-300 font-medium border border-pink-400/30 hover:border-pink-400/50 rounded-lg bg-pink-400/5 hover:bg-pink-400/10 transition-all duration-300">
                <i class="fas fa-users mr-2"></i>
                Browse All Curators
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default CuratorSpotlights;