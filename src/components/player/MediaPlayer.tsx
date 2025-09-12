import { Component, createSignal, Show } from 'solid-js';
import { currentTrack } from '../../stores/playerStore';
import Player from './Player';
import YouTubeMedia from './YouTubeMedia';
import SpotifyMedia from './SpotifyMedia';

interface MediaPlayerProps {
  // Simplified interface - no more compact/force compact props
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
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
          />
        );
      case 'spotify':
        return (
          <SpotifyMedia 
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
          />
        );
      default:
        // Fallback for unknown sources
        return (
          <div class="bg-gray-800 rounded flex items-center justify-center w-48 h-44 sm:w-72 sm:h-52">
            <div class="text-gray-400 text-center">
              <i class="fas fa-music text-5xl mb-3"></i>
              <div class="text-xl">Unknown</div>
            </div>
          </div>
        );
    }
  };

  return (
    <Show when={currentTrack()}>
      <Player
        mediaComponent={getMediaComponent()}
        onTogglePlay={onTogglePlay}
        playerReady={playerReady}
      />
    </Show>
  );
};

export default MediaPlayer;