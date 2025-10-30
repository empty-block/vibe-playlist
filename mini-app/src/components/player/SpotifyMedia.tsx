import { Component, Show, createSignal, createEffect, onMount, onCleanup, untrack } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying, setCurrentTime, setDuration, setIsSeekable, playNextTrack, handleTrackError } from '../../stores/playerStore';
import { isInFarcasterSync } from '../../stores/farcasterStore';
import { spotifyAccessToken, isSpotifyAuthenticated } from '../../stores/authStore';
import SpotifyLoginPrompt from './SpotifyLoginPrompt';
import { playTrackOnConnect, getPlaybackState, togglePlaybackOnConnect, seekOnConnect, waitForActiveDevice } from '../../services/spotifyConnect';

// Persistent Spotify Connect state (survives component remounts)
// This is necessary because SpotifyMedia remounts on every track change
const [persistentDeviceName, setPersistentDeviceName] = createSignal<string>('');
const [persistentConnectReady, setPersistentConnectReady] = createSignal(false);

interface SpotifyMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
  onPause?: (pauseFn: () => void) => void;
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
    spotifySDKReady: boolean;
    loadSpotifySDK: () => Promise<void>;
  }
}

const SpotifyMedia: Component<SpotifyMediaProps> = (props) => {
  // Browser Web Playback SDK state
  let player: any;
  const [playerReady, setPlayerReady] = createSignal(false);
  const [deviceId, setDeviceId] = createSignal<string>('');
  const [sdkFailed, setSdkFailed] = createSignal(false);

  // Farcaster Spotify Connect state (local to this component instance)
  const [waitingForDevice, setWaitingForDevice] = createSignal(false);
  const [connectionFailed, setConnectionFailed] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false); // Prevent auto-play during initial connection
  let pollingInterval: number | undefined;

  // Use persistent signals for state that needs to survive remounts
  const connectReady = persistentConnectReady;
  const setConnectReady = setPersistentConnectReady;
  const deviceName = persistentDeviceName;
  const setDeviceName = setPersistentDeviceName;

  const openInSpotify = async () => {
    const track = currentTrack();
    if (!track?.sourceId) return;

    // Verify authentication before using Connect API
    if (!isSpotifyAuthenticated()) {
      console.error('Cannot start playback - user not authenticated');
      handleTrackError('Please login to Spotify first', false);
      return;
    }

    // In Farcaster, use hybrid device detection flow
    if (isInFarcasterSync()) {
      console.log('Starting playback via Spotify Connect API...');

      // Set connecting flag to prevent auto-play effect from triggering
      setIsConnecting(true);

      // Reset failure state but keep connectReady/deviceName if device was previously active
      setConnectionFailed(false);
      setWaitingForDevice(false);

      // Try Connect API first (will work if device already active)
      const success = await playTrackOnConnect(track.sourceId);

      if (success) {
        console.log('Playback started via API - device already active');
        setIsPlaying(true);
        setConnectReady(true);
        // Keep existing deviceName or set a default if not present
        if (!deviceName()) {
          console.log('[openInSpotify] Setting deviceName to "Spotify"');
          setDeviceName('Spotify');
        } else {
          console.log('[openInSpotify] deviceName already set:', deviceName());
        }
        startPlaybackPolling();
        setIsConnecting(false); // Connection complete
        return;
      }

      // No active device - open Spotify link and wait for device
      console.log('No active device - opening Spotify and waiting...');
      const spotifyUrl = `https://open.spotify.com/track/${track.sourceId}`;
      window.open(spotifyUrl, '_blank');

      // Show waiting UI
      setWaitingForDevice(true);

      // Wait for device to become active (max 20 seconds)
      const result = await waitForActiveDevice();

      if (result.success) {
        console.log('Device is now active - retrying playback');
        const newDeviceName = result.deviceName || 'Spotify';
        console.log('[openInSpotify] Setting deviceName after detection:', newDeviceName);
        setDeviceName(newDeviceName);

        // Try to start playback now that device is active
        const retrySuccess = await playTrackOnConnect(track.sourceId);

        if (retrySuccess) {
          console.log('Playback started successfully after device detection');
          setIsPlaying(true);
          setConnectReady(true);
          setWaitingForDevice(false);
          startPlaybackPolling();
          setIsConnecting(false); // Connection complete
        } else {
          console.error('Playback failed even after device detected');
          setWaitingForDevice(false);
          setConnectionFailed(true);
          setIsConnecting(false); // Connection failed
        }
      } else {
        console.log('Device detection timed out');
        setWaitingForDevice(false);
        setConnectionFailed(true);
        setIsConnecting(false); // Connection failed
      }

      return;
    }

    // Fallback for browser mode: open in Spotify app/web
    const spotifyUrl = `https://open.spotify.com/track/${track.sourceId}`;
    window.open(spotifyUrl, '_blank');
  };

  // Load SDK when authenticated (browser only)
  createEffect(() => {
    if (!isInFarcasterSync() && isSpotifyAuthenticated()) {
      const token = spotifyAccessToken();
      if (token && !window.Spotify && !window.spotifySDKLoading) {
        console.log('Loading Spotify SDK for browser playback...');
        window.loadSpotifySDK().catch(console.error);
      }
    }
  });

  // Initialize Web Playback SDK (browser only)
  onMount(() => {
    if (isInFarcasterSync()) return; // Skip SDK for Farcaster

    console.log('SpotifyMedia onMount - browser mode');

    const handleSDKReady = () => {
      console.log('Spotify SDK ready event received');
      initializeWebPlaybackSDK();
    };

    if (window.spotifySDKReady && window.Spotify && isSpotifyAuthenticated()) {
      console.log('Spotify SDK already loaded and ready');
      initializeWebPlaybackSDK();
    } else {
      console.log('Waiting for Spotify SDK to be ready...');
      window.addEventListener('spotify-sdk-ready', handleSDKReady);
    }

    onCleanup(() => {
      window.removeEventListener('spotify-sdk-ready', handleSDKReady);
      if (player) {
        player.disconnect();
      }
    });
  });

  const initializeWebPlaybackSDK = () => {
    const token = spotifyAccessToken();
    if (!token || !window.Spotify || player) {
      return;
    }

    console.log('Initializing Spotify Web Playback SDK...');

    player = new window.Spotify.Player({
      name: 'JAMZY Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(token);
      },
      volume: 0.5
    });

    // Error handling
    player.addListener('initialization_error', ({ message }: any) => {
      console.error('Spotify initialization error:', message);
      setSdkFailed(true);
    });

    player.addListener('authentication_error', ({ message }: any) => {
      console.error('Spotify authentication error:', message);
      setSdkFailed(true);
    });

    player.addListener('account_error', ({ message }: any) => {
      console.error('Spotify account error:', message);
      handleTrackError('Spotify Premium required', true);
    });

    player.addListener('playback_error', ({ message }: any) => {
      console.error('Spotify playback error:', message);
      handleTrackError('Spotify playback failed', true);
    });

    // Playback status updates
    player.addListener('player_state_changed', (state: any) => {
      if (state) {
        setIsPlaying(!state.paused);
        if (state.position !== undefined) {
          setCurrentTime(state.position / 1000);
        }
        if (state.duration !== undefined) {
          setDuration(state.duration / 1000);
        }
        setIsSeekable(true);

        const trackEnded = state.paused && state.duration > 0 && state.position >= state.duration - 1000;
        if (trackEnded) {
          playNextTrack();
        }
      }
    });

    // Ready
    player.addListener('ready', ({ device_id }: any) => {
      console.log('Spotify player ready with Device ID:', device_id);
      setDeviceId(device_id);
      setPlayerReady(true);
      props.onPlayerReady(true);
      props.onTogglePlay(() => togglePlaySDK());
      if (props.onSeek) {
        props.onSeek((time: number) => seekSDK(time));
      }
      if (props.onPause) {
        props.onPause(() => pauseSpotify());
      }
    });

    player.connect();
  };

  const togglePlaySDK = async () => {
    if (!playerReady()) return;
    try {
      if (isPlaying()) {
        await player.pause();
      } else {
        await player.resume();
      }
    } catch (error) {
      console.error('Error toggling Spotify playback:', error);
    }
  };

  const seekSDK = async (timeInSeconds: number) => {
    if (!playerReady()) return;
    try {
      await player.seek(Math.floor(timeInSeconds * 1000));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const pauseSpotify = async () => {
    console.log('[SpotifyMedia] Pause requested');

    // Browser SDK mode
    if (!isInFarcasterSync() && player && playerReady()) {
      console.log('[SpotifyMedia] Pausing Browser SDK player');
      try {
        await player.pause();
      } catch (err) {
        console.error('Failed to pause Spotify SDK player:', err);
      }
      return;
    }

    // Farcaster Connect mode
    if (isInFarcasterSync() && connectReady()) {
      console.log('[SpotifyMedia] Pausing Spotify Connect');
      stopPlaybackPolling();
      try {
        await togglePlaybackOnConnect(false);
      } catch (err) {
        console.error('Failed to pause Spotify on Connect:', err);
      }
      return;
    }

    console.log('[SpotifyMedia] No active player to pause');
  };

  const playTrackSDK = async (trackId: string, deviceIdValue: string) => {
    const token = spotifyAccessToken();
    if (!token) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: deviceIdValue,
          uris: [`spotify:track:${trackId}`],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403 && errorData.error?.reason === 'PREMIUM_REQUIRED') {
          handleTrackError('Spotify Premium required', true);
        } else {
          handleTrackError(`Spotify playback error: ${response.status}`, true);
        }
      }
    } catch (error) {
      console.error('Error playing Spotify track:', error);
      handleTrackError('Failed to start Spotify playback', true);
    }
  };

  // Play track when ready (browser only)
  createEffect(() => {
    if (isInFarcasterSync()) return;

    const track = currentTrack();
    const ready = playerReady();
    const device = deviceId();

    // If track switched to non-Spotify source, pause the player
    if (track && track.source !== 'spotify' && player && ready) {
      console.log('[Browser SDK] Track switched to non-Spotify source, pausing player');
      player.pause().catch((err: any) =>
        console.error('Failed to pause Spotify SDK player:', err)
      );
      return;
    }

    if (track && track.source === 'spotify' && track.sourceId && ready && device) {
      playTrackSDK(track.sourceId, device);
    }
  });

  // === FARCASTER SPOTIFY CONNECT LOGIC ===

  // Start playback state polling for Farcaster
  const startPlaybackPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    console.log('Starting Spotify Connect playback polling (every 2s)');
    pollingInterval = window.setInterval(async () => {
      const state = await getPlaybackState();
      if (state) {
        setIsPlaying(state.is_playing);
        setCurrentTime(state.progress_ms / 1000);
        if (state.item) {
          setDuration(state.item.duration_ms / 1000);
        }
        setIsSeekable(true);

        // Check if track ended
        if (state.item && state.progress_ms >= state.item.duration_ms - 1000) {
          console.log('Track ended - playing next');
          playNextTrack();
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const stopPlaybackPolling = () => {
    if (pollingInterval) {
      console.log('Stopping Spotify Connect playback polling');
      clearInterval(pollingInterval);
      pollingInterval = undefined;
    }
  };

  // Play track using Spotify Connect (Farcaster only)
  const playTrackConnect = async (trackId: string) => {
    console.log('Playing track via Spotify Connect:', trackId);
    const success = await playTrackOnConnect(trackId);
    if (success) {
      console.log('Track started on Spotify Connect - starting polling');
      setConnectReady(true);
      startPlaybackPolling();
    } else {
      console.error('Failed to start track on Spotify Connect');
      handleTrackError('Could not play on Spotify - make sure Spotify is open', false);
    }
  };

  // Auto-play track changes when device is already connected (Farcaster only)
  // This effect only watches trackId changes, not play/pause state
  createEffect(() => {
    if (!isInFarcasterSync()) {
      console.log('[Auto-play Effect] Not in Farcaster, skipping');
      return;
    }

    const track = currentTrack();
    const hasDevice = deviceName(); // Device already connected from previous track
    const connecting = isConnecting(); // Skip during initial connection

    console.log('[Auto-play Effect] Triggered with:', {
      trackId: track?.sourceId,
      trackSource: track?.source,
      hasDevice: !!hasDevice,
      deviceName: hasDevice,
      connecting,
    });

    // If track switched to non-Spotify source, stop Spotify playback
    if (track && track.source !== 'spotify') {
      console.log('[Auto-play Effect] 🛑 Track switched to non-Spotify source, pausing Spotify');
      stopPlaybackPolling();
      // Pause Spotify playback using Connect API
      if (connectReady()) {
        togglePlaybackOnConnect(false).catch(err =>
          console.error('Failed to pause Spotify on track switch:', err)
        );
      }
      return;
    }

    // Only auto-play if we have a connected device AND not currently connecting
    // This prevents double-play on first track while enabling auto-play for subsequent tracks
    if (track && track.source === 'spotify' && track.sourceId && hasDevice && !connecting) {
      console.log('[Auto-play Effect] ✅ All conditions met - auto-playing:', track.sourceId);

      // Use untrack to avoid re-triggering on isPlaying changes
      untrack(async () => {
        const success = await playTrackOnConnect(track.sourceId);
        if (success) {
          console.log('Track started on Spotify Connect - starting polling');
          setConnectReady(true);
          startPlaybackPolling();
        } else {
          // Device might have gone inactive - fallback to openInSpotify flow
          console.warn('playTrackConnect failed - falling back to openInSpotify');
          await openInSpotify();
        }
      });
    } else {
      console.log('[Auto-play Effect] ❌ Conditions not met, skipping auto-play');
    }
  });

  // Toggle play/pause using Spotify Connect (Farcaster only)
  const togglePlayConnect = async () => {
    if (!connectReady()) {
      console.warn('Connect API not ready yet');
      return;
    }

    const playing = isPlaying();
    console.log('Toggling Spotify Connect playback:', playing ? 'pause' : 'play');

    const newState = !playing;
    const success = await togglePlaybackOnConnect(newState);

    if (success) {
      setIsPlaying(newState);
    } else {
      console.error('Failed to toggle Spotify Connect playback');
    }
  };

  // Setup Connect API controls for Farcaster
  onMount(() => {
    if (!isInFarcasterSync()) return;

    console.log('SpotifyMedia onMount - Farcaster mode (Spotify Connect)');

    // We're ready for Connect API immediately
    setConnectReady(true);
    props.onPlayerReady(true);

    // Wire up toggle play to use Spotify Connect API
    props.onTogglePlay(() => togglePlayConnect());

    // Wire up seek if provided
    if (props.onSeek) {
      props.onSeek(async (time: number) => {
        await seekOnConnect(time * 1000);
      });
    }

    // Wire up pause if provided
    if (props.onPause) {
      props.onPause(() => pauseSpotify());
    }

    onCleanup(() => {
      stopPlaybackPolling();
    });
  });

  return (
    <Show
      when={isInFarcasterSync()}
      fallback={
        // Browser: Show login prompt or Web Playback SDK player
        <Show
          when={isSpotifyAuthenticated()}
          fallback={<SpotifyLoginPrompt />}
        >
          <Show
            when={!sdkFailed()}
            fallback={
              // SDK failed - show fallback button
              <div class="relative bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex flex-col items-center justify-center">
                <Show when={currentTrack()?.thumbnail}>
                  <img
                    src={currentTrack()?.thumbnail}
                    alt={currentTrack()?.title}
                    class="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                </Show>
                <div class="relative z-10 flex flex-col items-center justify-center gap-4 p-4 text-center">
                  <i class="fab fa-spotify text-green-400 text-5xl"></i>
                  <div class="text-white">
                    <div class="font-bold text-sm line-clamp-1">{currentTrack()?.title}</div>
                    <div class="text-xs opacity-75 line-clamp-1">{currentTrack()?.artist}</div>
                  </div>
                  <button
                    onClick={openInSpotify}
                    class="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center gap-2"
                  >
                    <i class="fab fa-spotify"></i>
                    Play on Spotify
                  </button>
                </div>
              </div>
            }
          >
            {/* Web Playback SDK player UI */}
            <div class="bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex items-center justify-center">
              <i class="fab fa-spotify text-green-400 text-6xl sm:text-8xl"></i>
            </div>
          </Show>
        </Show>
      }
    >
      {/* Farcaster: Show login prompt or "Play on Spotify" button with states */}
      <Show
        when={isSpotifyAuthenticated()}
        fallback={<SpotifyLoginPrompt />}
      >
        <div class="relative bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex flex-col items-center justify-center">
          <Show when={currentTrack()?.thumbnail}>
            <img
              src={currentTrack()?.thumbnail}
              alt={currentTrack()?.title}
              class="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          </Show>

          <div class="relative z-10 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <i class="fab fa-spotify text-green-400 text-5xl"></i>

            <div class="text-white">
              <div class="font-bold text-sm line-clamp-1">{currentTrack()?.title}</div>
              <div class="text-xs opacity-75 line-clamp-1">{currentTrack()?.artist}</div>
            </div>

            {/* Show different states - use fallback pattern for clarity */}
            <Show
              when={waitingForDevice()}
              fallback={
                <Show
                  when={connectReady() && deviceName()}
                  fallback={
                    <Show
                      when={connectionFailed()}
                      fallback={
                        /* Default state - show Play on Spotify button */
                        <>
                          <button
                            onClick={openInSpotify}
                            class="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center gap-2"
                          >
                            <i class="fab fa-spotify"></i>
                            Play on Spotify
                          </button>
                          <div class="text-xs text-white/60">
                            Opens in Spotify app or web player
                          </div>
                        </>
                      }
                    >
                      {/* Failed state with retry */}
                      <div class="flex flex-col items-center gap-2">
                        <div class="text-yellow-400 text-xs font-semibold">ℹ️ Manual Playback Required</div>
                        <div class="text-white/70 text-xs">Play the track in your Spotify app,</div>
                        <div class="text-white/70 text-xs">then return here for controls</div>
                        <button
                          onClick={openInSpotify}
                          class="mt-2 bg-white/20 hover:bg-white/30 text-white font-bold py-1.5 px-3 rounded-full text-xs transition-colors flex items-center gap-1"
                        >
                          <i class="fas fa-redo"></i>
                          Try Again
                        </button>
                      </div>
                    </Show>
                  }
                >
                  {/* Connected state */}
                  <div class="flex flex-col items-center gap-1">
                    <div class="text-green-400 text-xs font-semibold">✓ Connected to Spotify</div>
                    <div class="text-white/60 text-xs">Now playing on: {deviceName()}</div>
                  </div>
                </Show>
              }
            >
              {/* Waiting for device state */}
              <div class="flex flex-col items-center gap-2">
                <div class="text-white text-sm font-semibold">⏳ Waiting for Spotify...</div>
                <div class="text-white/70 text-xs">Opening track in Spotify app</div>
                <div class="text-white/70 text-xs">Controls will appear when playback starts</div>
                {/* Loading animation */}
                <div class="flex gap-1 mt-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0s"></div>
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </Show>
  );
};

export default SpotifyMedia;