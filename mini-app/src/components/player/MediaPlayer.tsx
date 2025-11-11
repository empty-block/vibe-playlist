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
        // Debug: log track data
        console.log('[Tortoise Player] Track data:', {
          url: track.url,
          sourceId: track.sourceId,
          title: track.title
        });

        // Construct Tortoise URL from sourceId if url is missing
        const tortoiseUrl = track.url || `https://tortoise.studio/song/${track.sourceId}`;

        return (
          <div
            class="relative bg-gradient-to-br from-purple-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex items-center justify-center cursor-pointer group transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
            onClick={async () => {
              console.log('[Tortoise Player] Opening:', tortoiseUrl);

              try {
                // Use Farcaster SDK for mini-app-to-mini-app navigation
                const { default: sdk } = await import('@farcaster/miniapp-sdk');
                await sdk.actions.openMiniApp({ url: tortoiseUrl });
                console.log('[Tortoise Player] Opened via Farcaster SDK openMiniApp');
              } catch (error) {
                console.error('[Tortoise Player] SDK failed, using fallback:', error);
                // Fallback for non-mini-app environments (web browser)
                window.open(tortoiseUrl, '_blank');
              }
            }}
          >
            {/* Large background logo */}
            <img
              src="/tortoise-logo.avif"
              alt="Tortoise"
              class="absolute inset-0 w-full h-full object-contain p-8 opacity-90 group-hover:opacity-100 transition-opacity duration-200"
            />

            {/* Overlay gradient for text readability - very light to keep logo bright */}
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Call-to-action text overlay */}
            <div class="relative z-10 flex flex-col items-center justify-end h-full pb-6 sm:pb-8 text-center px-4">
              <div class="text-white font-bold text-base sm:text-lg drop-shadow-lg">
                Open in Tortoise
              </div>
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