import { Component, For, Show } from 'solid-js';
import { NetworkActivity, CommunityPlaylist, CuratorSuggestion } from '../../types/community';

interface CommunitySidebarProps {
  networkActivity: NetworkActivity | null;
  communityPlaylists: CommunityPlaylist[];
  curatorSuggestions: CuratorSuggestion[];
  isNetworkLoading: boolean;
  isPlaylistsLoading: boolean;
  isSuggestionsLoading: boolean;
}

const CommunitySidebar: Component<CommunitySidebarProps> = (props) => {
  const handleFollowCurator = (curatorId: string) => {
    console.log('Following curator:', curatorId);
    // TODO: Implement follow functionality
  };

  const handleJoinPlaylist = (playlistId: string) => {
    console.log('Joining playlist:', playlistId);
    // TODO: Implement playlist join functionality  
  };

  return (
    <div class="community-sidebar space-y-6">
      
      {/* Network Activity Summary */}
      <div class="network-summary">
        <div class="bg-gradient-to-b from-slate-800/60 to-slate-700/40 border-2 border-blue-400/30 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-users text-blue-400"></i>
            <h3 class="text-blue-300 font-semibold">Your Network</h3>
          </div>

          <Show
            when={!props.isNetworkLoading && props.networkActivity}
            fallback={
              <div class="space-y-3 animate-pulse">
                <div class="h-4 bg-blue-400/20 rounded"></div>
                <div class="h-4 bg-blue-400/20 rounded w-3/4"></div>
                <div class="h-4 bg-blue-400/20 rounded w-1/2"></div>
              </div>
            }
          >
            <div class="space-y-3">
              <div class="network-stats grid grid-cols-1 gap-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-blue-200/80">New shares today</span>
                  <span class="text-blue-400 font-mono font-bold">
                    {props.networkActivity?.summary.sharesLast24h}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-200/80">Active conversations</span>
                  <span class="text-blue-400 font-mono font-bold">
                    {props.networkActivity?.summary.conversationsLast24h}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-blue-200/80">New curators</span>
                  <span class="text-blue-400 font-mono font-bold">
                    {props.networkActivity?.summary.newCuratorsLast24h}
                  </span>
                </div>
              </div>

              <Show when={props.networkActivity?.recentShares && props.networkActivity.recentShares.length > 0}>
                <div class="recent-share border-t border-blue-400/20 pt-3">
                  <div class="text-blue-300/80 text-sm mb-2">Latest from friends:</div>
                  <For each={props.networkActivity.recentShares.slice(0, 1)}>
                    {(share) => (
                      <div class="flex items-center gap-2 text-sm">
                        <img 
                          src={share.sharedBy.avatar} 
                          alt={share.sharedBy.displayName}
                          class="w-6 h-6 rounded-full border border-blue-400/30"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="text-blue-200 truncate">
                            <span class="font-medium">{share.sharedBy.displayName}</span> shared
                          </div>
                          <div class="text-blue-300/70 text-xs truncate">
                            {share.track.title} - {share.track.artist}
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>

              <button class="w-full py-2 px-3 text-blue-400 hover:text-blue-300 border border-blue-400/30 hover:border-blue-400/50 bg-blue-400/5 hover:bg-blue-400/10 rounded-lg text-sm transition-all duration-300">
                View All Network Activity
              </button>
            </div>
          </Show>
        </div>
      </div>

      {/* Curator Suggestions */}
      <div class="curator-suggestions">
        <div class="bg-gradient-to-b from-slate-800/60 to-slate-700/40 border-2 border-pink-400/30 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-star text-pink-400"></i>
            <h3 class="text-pink-300 font-semibold">Suggested Curators</h3>
          </div>

          <Show
            when={!props.isSuggestionsLoading}
            fallback={
              <div class="space-y-4">
                <For each={[1, 2]}>
                  {() => (
                    <div class="animate-pulse">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 bg-pink-400/20 rounded-full"></div>
                        <div class="flex-1 space-y-1">
                          <div class="h-3 bg-pink-400/20 rounded w-3/4"></div>
                          <div class="h-2 bg-pink-400/20 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div class="h-8 bg-pink-400/20 rounded"></div>
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <div class="space-y-4">
              <For each={props.curatorSuggestions.slice(0, 2)}>
                {(suggestion) => (
                  <div class="curator-suggestion-item">
                    <div class="flex items-start gap-3 mb-3">
                      <img 
                        src={suggestion.curator.avatar} 
                        alt={suggestion.curator.displayName}
                        class="w-10 h-10 rounded-full border border-pink-400/30"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-pink-200 font-medium text-sm truncate">
                            {suggestion.curator.displayName}
                          </span>
                          <Show when={suggestion.curator.isOnline}>
                            <div class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                          </Show>
                        </div>
                        <div class="text-pink-300/70 text-xs mb-1">
                          @{suggestion.curator.username}
                        </div>
                        <div class="text-pink-400/60 text-xs">
                          {suggestion.reason} • {suggestion.matchScore}% match
                        </div>
                        
                        <Show when={suggestion.mutualConnections.length > 0}>
                          <div class="flex items-center gap-1 mt-1 text-xs text-pink-400/50">
                            <i class="fas fa-users"></i>
                            <span>{suggestion.mutualConnections.length} mutual</span>
                          </div>
                        </Show>
                      </div>
                    </div>

                    <Show when={suggestion.sampleTracks.length > 0}>
                      <div class="sample-track bg-pink-400/5 border border-pink-400/20 rounded p-2 mb-3">
                        <div class="flex items-center gap-2">
                          <img 
                            src={suggestion.sampleTracks[0].thumbnail} 
                            alt={suggestion.sampleTracks[0].title}
                            class="w-6 h-6 rounded border border-pink-400/30"
                          />
                          <div class="flex-1 min-w-0 text-xs">
                            <div class="text-pink-200 truncate">
                              {suggestion.sampleTracks[0].title}
                            </div>
                            <div class="text-pink-300/70 truncate">
                              {suggestion.sampleTracks[0].artist}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Show>

                    <button 
                      class="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                      onClick={() => handleFollowCurator(suggestion.curator.userId)}
                    >
                      <i class="fas fa-user-plus mr-2"></i>
                      Follow
                    </button>
                  </div>
                )}
              </For>

              <button class="w-full py-2 px-3 text-pink-400 hover:text-pink-300 border border-pink-400/30 hover:border-pink-400/50 bg-pink-400/5 hover:bg-pink-400/10 rounded-lg text-sm transition-all duration-300">
                Discover More Curators
              </button>
            </div>
          </Show>
        </div>
      </div>

      {/* Community Playlists */}
      <div class="community-playlists">
        <div class="bg-gradient-to-b from-slate-800/60 to-slate-700/40 border-2 border-green-400/30 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-list-music text-green-400"></i>
            <h3 class="text-green-300 font-semibold">Community Playlists</h3>
          </div>

          <Show
            when={!props.isPlaylistsLoading}
            fallback={
              <div class="space-y-4">
                <For each={[1, 2]}>
                  {() => (
                    <div class="animate-pulse space-y-2">
                      <div class="h-4 bg-green-400/20 rounded w-3/4"></div>
                      <div class="h-3 bg-green-400/20 rounded w-1/2"></div>
                      <div class="h-8 bg-green-400/20 rounded"></div>
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <div class="space-y-4">
              <For each={props.communityPlaylists.slice(0, 2)}>
                {(playlist) => (
                  <div class="playlist-item">
                    <div class="mb-3">
                      <div class="text-green-200 font-medium text-sm mb-1">
                        {playlist.name}
                      </div>
                      <div class="text-green-300/70 text-xs mb-2 leading-relaxed">
                        {playlist.description}
                      </div>
                      
                      <div class="flex items-center gap-3 text-xs text-green-400/60 mb-2">
                        <div class="flex items-center gap-1">
                          <img 
                            src={playlist.createdBy.avatar} 
                            alt={playlist.createdBy.displayName}
                            class="w-4 h-4 rounded-full border border-green-400/30"
                          />
                          <span>by {playlist.createdBy.displayName}</span>
                        </div>
                        <span>•</span>
                        <span>{playlist.trackCount} tracks</span>
                        <span>•</span>
                        <span>{playlist.contributors.length} contributors</span>
                      </div>

                      <Show when={playlist.tags.length > 0}>
                        <div class="flex flex-wrap gap-1 mb-3">
                          <For each={playlist.tags.slice(0, 3)}>
                            {(tag) => (
                              <span class="inline-block px-2 py-1 text-xs bg-green-400/10 text-green-300 rounded border border-green-400/20">
                                {tag}
                              </span>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>

                    <button 
                      class="w-full py-2 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                      onClick={() => handleJoinPlaylist(playlist.id)}
                    >
                      <i class="fas fa-plus mr-2"></i>
                      Join Playlist
                    </button>
                  </div>
                )}
              </For>

              <button class="w-full py-2 px-3 text-green-400 hover:text-green-300 border border-green-400/30 hover:border-green-400/50 bg-green-400/5 hover:bg-green-400/10 rounded-lg text-sm transition-all duration-300">
                Browse All Playlists
              </button>
            </div>
          </Show>
        </div>
      </div>

    </div>
  );
};

export default CommunitySidebar;