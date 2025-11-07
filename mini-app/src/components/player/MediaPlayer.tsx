import { Component, createSignal, Show, createEffect } from 'solid-js';
import { currentTrack } from '../../stores/playerStore';
import Player from './Player';
import YouTubeMedia from './YouTubeMedia';
import SpotifyMedia from './SpotifyMedia';
import SoundCloudMedia from './SoundCloudMedia';
import SonglinkMedia from './SonglinkMedia';
import AppleMusicMedia from './AppleMusicMedia';

interface MediaPlayerProps {
  // Simplified interface - no more compact/force compact props
}

type MediaSource = 'youtube' | 'spotify' | 'soundcloud' | 'songlink' | 'apple_music' | 'tortoise' | null;

const MediaPlayer: Component<MediaPlayerProps> = (props) => {
  const [playerReady, setPlayerReady] = createSignal(false);
  const [togglePlayFn, setTogglePlayFn] = createSignal<(() => void) | null>(null);
  const [seekFn, setSeekFn] = createSignal<((time: number) => void) | null>(null);
  const [hasStartedPlayback, setHasStartedPlayback] = createSignal(false);

  // Track previous source and pause functions for cross-player coordination
  const [previousSource, setPreviousSource] = createSignal<MediaSource>(null);
  const [youtubePauseFn, setYoutubePauseFn] = createSignal<(() => void) | null>(null);
  const [spotifyPauseFn, setSpotifyPauseFn] = createSignal<(() => void) | null>(null);
  const [soundcloudPauseFn, setSoundcloudPauseFn] = createSignal<(() => void) | null>(null);

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

  // Centralized pause coordination - pauses previous player when source changes
  createEffect(() => {
    const track = currentTrack();
    const currentSource = track?.source as MediaSource;

    console.log('[MediaPlayer] Source tracking:', {
      previousSource: previousSource(),
      currentSource,
      trackTitle: track?.title
    });

    // Only pause if we have a previous source and it's different from current
    if (previousSource() && previousSource() !== currentSource) {
      console.log(`[MediaPlayer] Source changed from ${previousSource()} to ${currentSource} - pausing previous player`);

      // Pause the previous player
      switch (previousSource()) {
        case 'youtube':
          const ytPause = youtubePauseFn();
          if (ytPause) {
            console.log('[MediaPlayer] Calling YouTube pause function');
            ytPause();
          }
          break;
        case 'spotify':
          const spotifyPause = spotifyPauseFn();
          if (spotifyPause) {
            console.log('[MediaPlayer] Calling Spotify pause function');
            spotifyPause();
          }
          break;
        case 'soundcloud':
          const scPause = soundcloudPauseFn();
          if (scPause) {
            console.log('[MediaPlayer] Calling SoundCloud pause function');
            scPause();
          }
          break;
      }
    }

    // Update previous source
    setPreviousSource(currentSource);
  });

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
            onPause={(pauseFn) => setYoutubePauseFn(() => pauseFn)}
          />
        );
      case 'spotify':
        return (
          <SpotifyMedia
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
            onSeek={handleSeekSetup}
            onPause={(pauseFn) => setSpotifyPauseFn(() => pauseFn)}
          />
        );
      case 'soundcloud':
        return (
          <SoundCloudMedia
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
            onSeek={handleSeekSetup}
            onPause={(pauseFn) => setSoundcloudPauseFn(() => pauseFn)}
          />
        );
      case 'songlink':
        return (
          <SonglinkMedia
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
            onSeek={handleSeekSetup}
            onPlaybackStarted={handlePlaybackStarted}
            onPause={(pauseFn) => {}} // No-op pause since it resolves to another player
          />
        );
      case 'apple_music':
        return (
          <AppleMusicMedia
            onPlayerReady={handlePlayerReady}
            onTogglePlay={handleTogglePlaySetup}
            onSeek={handleSeekSetup}
            onPlaybackStarted={handlePlaybackStarted}
            onPause={(pauseFn) => {}} // No-op pause since it resolves to another player
          />
        );
      case 'tortoise':
        return (
          <div class="bg-gray-800 rounded flex flex-col items-center justify-center w-48 h-44 sm:w-72 sm:h-52 p-4">
            <div class="text-gray-300 text-center">
              <img
                src="/tortoise-logo.avif"
                alt="Tortoise"
                class="w-20 h-20 mb-4 mx-auto object-contain"
              />
              <button
                onClick={() => window.open(track.sourceUrl, '_blank')}
                class="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer border-none"
              >
                Open in Tortoise
              </button>
            </div>
          </div>
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