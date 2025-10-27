import { Component, createSignal, Show } from 'solid-js';
import { currentTrack } from '../../stores/playerStore';
import Player from './Player';
import YouTubeMedia from './YouTubeMedia';
import SpotifyMedia from './SpotifyMedia';
import SoundCloudMedia from './SoundCloudMedia';

interface MediaPlayerProps {
  // Simplified interface - no more compact/force compact props
}

const MediaPlayer: Component<MediaPlayerProps> = (props) => {
  const [playerReady, setPlayerReady] = createSignal(false);
  const [togglePlayFn, setTogglePlayFn] = createSignal<(() => void) | null>(null);
  const [seekFn, setSeekFn] = createSignal<((time: number) => void) | null>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = createSignal(false);

  const handlePlayerReady = (ready: boolean) => {
    setPlayerReady(ready);
  };

  const handleTogglePlaySetup = (toggleFn: () => void) => {
    setTogglePlayFn(() => toggleFn);
  };

  const handleSeekSetup = (seekFunc: (time: number) => void) => {
    setSeekFn(() => seekFunc);
  };

  const handlePlaybackStarted = (hasStarted: boolean) => {
    setHasStartedPlayback(hasStarted);
  };

  const onTogglePlay = () => {
    const toggleFn = togglePlayFn();
    if (toggleFn) {
      toggleFn();
    }
  };

  const onSeek = (time: number) => {
    const seekFunc = seekFn();
    if (seekFunc) {
      seekFunc(time);
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
            onSeek={handleSeekSetup}
            onPlaybackStarted={handlePlaybackStarted}
          />
        );
      case 'spotify':
        return (
          <SpotifyMedia
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
            onSeek={handleSeekSetup}
          />
        );
      case 'soundcloud':
        return (
          <SoundCloudMedia
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
            onSeek={handleSeekSetup}
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
        onSeek={onSeek}
        hasStartedPlayback={hasStartedPlayback}
      />
    </Show>
  );
};

export default MediaPlayer;