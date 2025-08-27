import { Component, For, Show } from 'solid-js';
import { FreshTrack } from '../../types/discover';

interface FreshDropsSectionProps {
  tracks: FreshTrack[];
  isLoading: boolean;
}

const FreshDropsSection: Component<FreshDropsSectionProps> = (props) => {
  return (
    <div class="discover-section fresh-drops mb-8">
      <div class="retro-music-terminal bg-gradient-to-b from-slate-900/60 to-black/60 border-2 border-green-400/30 rounded-xl p-6">
        <div class="section-header mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="retro-section-title flex items-center gap-3 text-2xl font-bold text-white mb-2">
                <i class="fas fa-clock text-green-400"></i>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                  Fresh Drops
                </span>
              </h2>
              <p class="retro-section-subtitle text-green-300/70 text-sm font-mono">
                Last 24 hours of discoveries
              </p>
            </div>
            <div class="text-green-400/60 text-xs font-mono">
              {props.tracks.length} new tracks
            </div>
          </div>
        </div>

        <Show
          when={!props.isLoading}
          fallback={
            <div class="space-y-4">
              <For each={[1, 2, 3, 4, 5]}>
                {() => (
                  <div class="fresh-track-skeleton animate-pulse">
                    <div class="flex gap-4 p-4 bg-slate-800/40 rounded-lg border border-green-400/10">
                      <div class="w-4 bg-green-400/20 rounded"></div>
                      <div class="w-14 h-14 bg-green-400/20 rounded-lg"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-green-400/20 rounded w-3/4"></div>
                        <div class="h-3 bg-green-400/20 rounded w-1/2"></div>
                        <div class="h-3 bg-green-400/20 rounded w-2/3"></div>
                      </div>
                      <div class="w-16 h-4 bg-green-400/20 rounded"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <div class="retro-timeline-feed">
            <For each={props.tracks}>
              {(track, index) => (
                <div class="timeline-track-item group relative">
                  {/* Timeline connector */}
                  <Show when={index() < props.tracks.length - 1}>
                    <div class="absolute left-6 top-20 w-0.5 h-8 bg-gradient-to-b from-green-400/40 to-transparent"></div>
                  </Show>

                  <div class="flex gap-4 p-4 hover:bg-slate-800/30 rounded-lg transition-colors duration-300 cursor-pointer">
                    
                    {/* Timeline Dot */}
                    <div class="timeline-dot flex-shrink-0 relative">
                      <div class="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 shadow-lg shadow-green-400/30 relative z-10">
                        <div class="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 animate-ping opacity-20"></div>
                      </div>
                    </div>

                    {/* Track Artwork */}
                    <div class="track-artwork flex-shrink-0 relative">
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        class="w-14 h-14 rounded-lg shadow-lg object-cover border border-green-400/20 group-hover:border-green-400/40 transition-colors duration-300"
                      />
                      <div class="absolute inset-0 bg-green-400/0 group-hover:bg-green-400/10 rounded-lg transition-colors duration-300"></div>
                      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <i class="fas fa-play text-white text-sm drop-shadow-lg"></i>
                      </div>
                    </div>

                    {/* Track Info & Context */}
                    <div class="track-info flex-1 min-w-0">
                      <div class="mb-2">
                        <div class="track-title text-white font-semibold truncate group-hover:text-green-300 transition-colors duration-300">
                          {track.title}
                        </div>
                        <div class="track-artist text-green-300/80 text-sm truncate">
                          {track.artist}
                        </div>
                      </div>

                      {/* User Context */}
                      <div class="user-context mb-2">
                        <div class="flex items-center gap-2 text-sm">
                          <span class="text-lg">{track.userAvatar}</span>
                          <span class="text-green-400 font-medium">{track.userDisplayName}</span>
                          <span class="text-green-400/60">shared</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <Show when={track.comment}>
                        <div class="comment bg-green-400/5 border border-green-400/20 rounded-lg p-3 mt-2">
                          <div class="text-green-200/90 text-sm italic">
                            "{track.comment}"
                          </div>
                        </div>
                      </Show>

                      {/* Metadata */}
                      <div class="flex items-center gap-3 mt-3 text-xs font-mono">
                        <div class="flex items-center gap-1 text-green-400/70">
                          <i class="fas fa-music"></i>
                          <span>{track.duration}</span>
                        </div>
                        <div class="flex items-center gap-1 text-green-400/70">
                          <i class="fab fa-spotify"></i>
                          <span class="capitalize">{track.source}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Ago */}
                    <div class="time-ago flex-shrink-0 text-right">
                      <div class="text-green-400 text-sm font-mono mb-1">
                        {track.timeAgo}
                      </div>
                      
                      {/* Quick Actions */}
                      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button class="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center text-green-400 hover:text-green-300 transition-colors duration-200">
                          <i class="fas fa-play text-xs"></i>
                        </button>
                        <button class="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center text-green-400 hover:text-green-300 transition-colors duration-200">
                          <i class="fas fa-share text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </For>

            {/* Load More Indicator */}
            <div class="text-center pt-6">
              <button class="px-4 py-2 text-green-400 hover:text-green-300 text-sm font-mono border border-green-400/30 hover:border-green-400/50 rounded-lg bg-green-400/5 hover:bg-green-400/10 transition-all duration-300">
                <i class="fas fa-chevron-down mr-2"></i>
                Load more tracks
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default FreshDropsSection;