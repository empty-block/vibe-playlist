import { Component, For, Show } from 'solid-js';
import { TrendingTrack } from '../../types/discover';

interface TrendingSectionProps {
  tracks: TrendingTrack[];
  isLoading: boolean;
}

const TrendingSection: Component<TrendingSectionProps> = (props) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div class="discover-section trending-enhanced mb-8">
      <div class="retro-music-terminal bg-gradient-to-b from-slate-900/60 to-black/60 border-2 border-orange-400/30 rounded-xl p-6">
        <div class="retro-terminal-header mb-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="retro-terminal-title flex items-center gap-3 text-2xl font-bold text-white mb-2">
                <i class="fas fa-fire text-orange-400"></i>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  Trending This Week
                </span>
              </div>
              <div class="retro-terminal-subtitle text-orange-300/70 text-sm font-mono">
                Most shared tracks across the network
              </div>
            </div>
            <div class="text-orange-400/60 text-xs font-mono">
              {props.tracks.length} tracks
            </div>
          </div>
        </div>

        <Show
          when={!props.isLoading}
          fallback={
            <div class="space-y-4">
              <For each={[1, 2, 3, 4]}>
                {() => (
                  <div class="retro-track-skeleton animate-pulse">
                    <div class="flex items-center gap-4 p-4 bg-slate-800/40 rounded-lg border border-orange-400/10">
                      <div class="w-8 h-8 bg-orange-400/20 rounded"></div>
                      <div class="w-16 h-16 bg-orange-400/20 rounded-lg"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-orange-400/20 rounded w-3/4"></div>
                        <div class="h-3 bg-orange-400/20 rounded w-1/2"></div>
                      </div>
                      <div class="w-20 h-4 bg-orange-400/20 rounded"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <div class="retro-track-list space-y-3">
            <For each={props.tracks}>
              {(track, index) => (
                <div class="retro-track-item group">
                  <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/40 hover:from-slate-700/80 hover:to-slate-600/60 rounded-lg border border-orange-400/20 hover:border-orange-400/40 transition-all duration-300 cursor-pointer">
                    
                    {/* Trend Rank */}
                    <div class="track-rank flex-shrink-0">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-orange-500/30">
                        #{index() + 1}
                      </div>
                    </div>

                    {/* Track Artwork */}
                    <div class="track-artwork flex-shrink-0 relative">
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        class="w-16 h-16 rounded-lg shadow-lg object-cover border border-orange-400/30"
                      />
                      <div class="absolute inset-0 bg-orange-400/0 group-hover:bg-orange-400/10 rounded-lg transition-colors duration-300"></div>
                      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i class="fas fa-play text-white text-lg drop-shadow-lg"></i>
                      </div>
                    </div>

                    {/* Track Info */}
                    <div class="track-info flex-1 min-w-0">
                      <div class="track-title text-white font-semibold truncate text-lg group-hover:text-orange-300 transition-colors duration-300">
                        {track.title}
                      </div>
                      <div class="track-artist text-orange-300/80 text-sm truncate mb-1">
                        {track.artist}
                      </div>
                      <div class="flex items-center gap-2 text-xs font-mono text-orange-400/60">
                        <span>{track.userAvatar}</span>
                        <span>@{track.addedBy}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(track.timestamp)}</span>
                      </div>
                    </div>

                    {/* Social Stats */}
                    <div class="social-stats flex-shrink-0 text-right">
                      <div class="flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-1 text-orange-400">
                          <i class="fas fa-share text-xs"></i>
                          <span class="font-mono">{track.socialContext.shareCount}</span>
                        </div>
                        <div class="flex items-center gap-1 text-orange-300/70">
                          <i class="fas fa-comment text-xs"></i>
                          <span class="font-mono">{track.socialContext.replyCount}</span>
                        </div>
                        <div class="flex items-center gap-1 text-orange-200/50">
                          <i class="fas fa-retweet text-xs"></i>
                          <span class="font-mono">{track.socialContext.recastCount}</span>
                        </div>
                      </div>
                      <div class="mt-2">
                        <div class="text-xs font-mono text-orange-400/40">
                          trend: {track.trendScore}%
                        </div>
                      </div>
                    </div>

                    {/* Genre Tags */}
                    <Show when={track.genre && track.genre.length > 0}>
                      <div class="genre-tags flex-shrink-0 hidden md:block">
                        <div class="flex flex-wrap gap-1 max-w-24">
                          <For each={track.genre?.slice(0, 2)}>
                            {(genre) => (
                              <span class="inline-block px-2 py-1 text-xs bg-orange-400/10 text-orange-300 rounded border border-orange-400/20 font-mono">
                                {genre}
                              </span>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>

                    {/* Play Button */}
                    <div class="track-actions flex-shrink-0">
                      <button class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <i class="fas fa-play text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default TrendingSection;