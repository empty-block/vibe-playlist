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
      {/* Only show header for vertical variant */}
      {variant() === 'vertical' && (
        <div 
          class="flex items-center justify-between mb-4 px-4 py-3 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(4, 202, 244, 0.3)',
            'box-shadow': 'inset 0 0 8px rgba(0, 0, 0, 0.6)'
          }}
        >
          <h3 
            class="text-sm font-mono font-bold uppercase tracking-wide flex items-center gap-2"
            style={{
              color: '#04caf4',
              'text-shadow': '0 0 4px rgba(4, 202, 244, 0.6)',
              'font-family': 'Courier New, monospace'
            }}
          >
            <i class="fas fa-radio" style={{ color: '#00f92a' }}></i>
            DISCOVER
          </h3>
        </div>
      )}

      {/* Container based on variant */}
      {variant() === 'horizontal' ? (
        <>
          {/* Horizontal Layout - using 8px base unit for spacing */}
          <div class="relative">
            {/* Wide Screen: 5-column grid for bigger cards */}
            <div class="hidden 2xl:block">
              <div class="grid grid-cols-5 gap-4 pb-4 px-4">
                <For each={props.playlists.slice(0, 5)}>
                  {(playlist) => (
                    <div class="p-1">
                      <PlaylistCard
                        playlist={playlist}
                        isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                        tracks={getPlaylistTracks(playlist.id)}
                        onClick={() => props.onPlaylistClick?.(playlist.id)}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Large Screen: 4-column grid */}
            <div class="hidden xl:block 2xl:hidden">
              <div class="grid grid-cols-4 gap-4 pb-4 px-4">
                <For each={props.playlists.slice(0, 4)}>
                  {(playlist) => (
                    <div class="p-1">
                      <PlaylistCard
                        playlist={playlist}
                        isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                        tracks={getPlaylistTracks(playlist.id)}
                        onClick={() => props.onPlaylistClick?.(playlist.id)}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Medium Screen: 3-column grid */}
            <div class="hidden lg:block xl:hidden">
              <div class="grid grid-cols-3 gap-4 pb-4 px-4">
                <For each={props.playlists.slice(0, 3)}>
                  {(playlist) => (
                    <div class="p-1">
                      <PlaylistCard
                        playlist={playlist}
                        isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                        tracks={getPlaylistTracks(playlist.id)}
                        onClick={() => props.onPlaylistClick?.(playlist.id)}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Small/Mobile: Horizontal scroll */}
            <div class="block lg:hidden">
              <div class="overflow-x-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
                <div class="flex gap-3 pb-4 px-4 min-w-max">
                  <For each={props.playlists}>
                    {(playlist) => (
                      <div class="p-1">
                        <PlaylistCard
                          playlist={playlist}
                          isCurrentlyPlaying={playlist.id === currentPlaylistId()}
                          tracks={getPlaylistTracks(playlist.id)}
                          onClick={() => props.onPlaylistClick?.(playlist.id)}
                        />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>

            {/* Neon Gradient Fade Edges (Only for horizontal scroll) */}
            <div class="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-black via-black to-transparent pointer-events-none lg:hidden z-10"></div>
            <div class="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-black via-black to-transparent pointer-events-none lg:hidden z-10"></div>
          </div>

          {/* Retro Scroll Hint (Mobile) */}
          <div class="text-center mt-3 md:hidden">
            <p 
              class="text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              style={{
                color: '#ff9b00',
                'text-shadow': '0 0 3px rgba(255, 155, 0, 0.5)',
                'font-family': 'Courier New, monospace'
              }}
            >
              <i class="fas fa-arrow-left" style={{ color: '#04caf4' }}></i>
              SWIPE TO SCAN
              <i class="fas fa-arrow-right" style={{ color: '#04caf4' }}></i>
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