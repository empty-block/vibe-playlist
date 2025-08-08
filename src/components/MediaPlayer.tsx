import { Component, createSignal, Show } from 'solid-js';
import { currentTrack } from '../stores/playlistStore';
import Player from './Player';
import YouTubeMedia from './YouTubeMedia';
import SpotifyMedia from './SpotifyMedia';

interface MediaPlayerProps {
  isCompact?: () => boolean;
  onForceCompact?: (force: boolean) => void;
}

const MediaPlayer: Component<MediaPlayerProps> = (props) => {
  const [playerReady, setPlayerReady] = createSignal(false);
  const [togglePlayFn, setTogglePlayFn] = createSignal<(() => void) | null>(null);
  
  const handlePlayerReady = (ready: boolean) => {
    setPlayerReady(ready);
  };
  
  const handleTogglePlaySetup = (toggleFn: () => void) => {
    setTogglePlayFn(() => toggleFn);
  };
  
  const onTogglePlay = () => {
    const toggleFn = togglePlayFn();
    if (toggleFn) {
      toggleFn();
    }
  };

  const getMediaComponent = () => {
    const track = currentTrack();
    if (!track) return null;

    switch (track.source) {
      case 'youtube':
        return (
          <YouTubeMedia 
            isCompact={props.isCompact}
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
          />
        );
      case 'spotify':
        return (
          <SpotifyMedia 
            isCompact={props.isCompact}
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
          />
        );
      default:
        // Fallback for unknown sources
        return (
          <div class={`bg-gray-800 rounded flex items-center justify-center ${props.isCompact?.() ? 'w-32 h-20 sm:w-40 sm:h-24' : 'w-full h-48'}`}>
            <div class="text-gray-400 text-center">
              <i class="fas fa-music text-4xl mb-2"></i>
              <div class="text-sm">Unsupported Source</div>
            </div>
          </div>
        );
    }
  };

  return (
    <Show when={currentTrack()}>
      <Player
        isCompact={props.isCompact}
        mediaComponent={getMediaComponent()}
        onTogglePlay={onTogglePlay}
        playerReady={playerReady}
        onForceCompact={props.onForceCompact}
      />
    </Show>
  );
};

export default MediaPlayer;