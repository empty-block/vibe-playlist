import { Component, For } from 'solid-js';
import { Playlist, playlistTracks, currentPlaylistId } from '../../stores/playlistStore';
import PlaylistCard from '../playlist/PlaylistCard';

interface DiscoveryBarProps {
  playlists: Playlist[];
  onPlaylistClick?: (playlistId: string) => void;
  variant?: 'horizontal' | 'vertical';
}

const DiscoveryBar: Component<DiscoveryBarProps> = (props) => {
  const variant = () => props.variant || 'horizontal';
  const maxVerticalPlaylists = 7; // Increased with compact cards
  const getPlaylistTracks = (playlistId: string) => {
    const tracks = playlistTracks[playlistId] || [];
    return tracks.map(track => ({
      thumbnail: track.thumbnail,
      title: track.title
    }));
  };

  return (
    <div class={variant() === 'horizontal' ? 'w-full mb-4' : 'h-full flex flex-col'}>
      {/* Section Header */}
      <div class="flex items-center justify-between mb-3 px-2">
        <h3 class="text-sm font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-compass"></i>
          {variant() === 'horizontal' ? 'Discover Playlists' : 'Discover'}
        </h3>
        {variant() === 'horizontal' && (
          <button class="text-xs text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        )}
      </div>

      {/* Container based on variant */}
      {variant() === 'horizontal' ? (
        <>
          {/* Horizontal Layout - existing code */}
          <div class="relative">
            {/* Wide Screen: Evenly distributed grid */}
            <div class="hidden xl:block">
              <div class="grid grid-cols-6 gap-4 pb-2 px-2">
                <For each={props.playlists.slice(0, 6)}>
                  {(playlist) => (
                    <PlaylistCard
                      playlist={playlist}
                      isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                      tracks={getPlaylistTracks(playlist.id)}
                      onClick={() => props.onPlaylistClick?.(playlist.id)}
                    />
                  )}
                </For>
              </div>
            </div>

            {/* Medium Screen: 4-column grid */}
            <div class="hidden lg:block xl:hidden">
              <div class="grid grid-cols-4 gap-4 pb-2 px-2">
                <For each={props.playlists.slice(0, 4)}>
                  {(playlist) => (
                    <PlaylistCard
                      playlist={playlist}
                      isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                      tracks={getPlaylistTracks(playlist.id)}
                      onClick={() => props.onPlaylistClick?.(playlist.id)}
                    />
                  )}
                </For>
              </div>
            </div>

            {/* Small/Mobile: Horizontal scroll */}
            <div class="block lg:hidden">
              <div class="overflow-x-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                <div class="flex gap-4 pb-2 px-2 min-w-max">
                  <For each={props.playlists}>
                    {(playlist) => (
                      <PlaylistCard
                        playlist={playlist}
                        isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                        tracks={getPlaylistTracks(playlist.id)}
                        onClick={() => props.onPlaylistClick?.(playlist.id)}
                      />
                    )}
                  </For>
                </div>
              </div>
            </div>

            {/* Gradient Fade Edges (Only for horizontal scroll) */}
            <div class="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-200 to-transparent pointer-events-none lg:hidden"></div>
            <div class="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gray-200 to-transparent pointer-events-none lg:hidden"></div>
          </div>

          {/* Scroll Hint (Mobile) */}
          <div class="text-center mt-2 md:hidden">
            <p class="text-xs text-gray-500 flex items-center justify-center gap-1">
              <i class="fas fa-arrow-left"></i>
              Swipe to explore
              <i class="fas fa-arrow-right"></i>
            </p>
          </div>
        </>
      ) : (
        /* Vertical Layout - Compact cards + scrollable (Spotify-style) */
        <div class="flex-1 overflow-y-auto px-2">
          <div class="space-y-1">
            <For each={props.playlists}>
              {(playlist) => (
                <PlaylistCard
                  playlist={playlist}
                  isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                  tracks={getPlaylistTracks(playlist.id)}
                  onClick={() => props.onPlaylistClick?.(playlist.id)}
                  variant="compact"
                />
              )}
            </For>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryBar;