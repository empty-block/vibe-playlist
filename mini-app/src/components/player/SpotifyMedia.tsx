import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying, setCurrentTime, setDuration, setIsSeekable, playNextTrack, handleTrackError } from '../../stores/playerStore';
import { spotifyAccessToken } from '../../stores/authStore';

interface SpotifyMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
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
  let player: any;
  const [playerReady, setPlayerReady] = createSignal(false);
  const [deviceId, setDeviceId] = createSignal<string>('');
  
  // Always use compact size for bottom bar

  // Load SDK when token is available
  createEffect(() => {
    const token = spotifyAccessToken();
    if (token && !window.Spotify && !window.spotifySDKReady) {
      console.log('Loading Spotify SDK for authenticated user...');
      window.loadSpotifySDK().catch(console.error);
    }
  });

  onMount(() => {
    console.log('SpotifyMedia onMount called');

    const handleSDKReady = () => {
      console.log('Spotify SDK ready event received');
      initializeSpotifyPlayer();
    };

    if (window.spotifySDKReady && window.Spotify) {
      console.log('Spotify SDK already loaded and ready');
      initializeSpotifyPlayer();
    } else {
      console.log('Waiting for Spotify SDK to be ready...');
      window.addEventListener('spotify-sdk-ready', handleSDKReady);
    }

    onCleanup(() => {
      window.removeEventListener('spotify-sdk-ready', handleSDKReady);
    });
  });

  const initializeSpotifyPlayer = () => {
    const token = spotifyAccessToken();
    if (!token || !window.Spotify) {
      console.log('No Spotify token or SDK available');
      return;
    }

    // Prevent multiple initializations
    if (player) {
      console.log('Spotify player already initialized, skipping...');
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
      handleTrackError('Spotify player initialization failed', false);
    });

    player.addListener('authentication_error', ({ message }: any) => {
      console.error('Spotify authentication error:', message);
      handleTrackError('Spotify authentication failed. Please reconnect your account.', false);
    });

    player.addListener('account_error', ({ message }: any) => {
      console.error('Spotify account error:', message);
      handleTrackError('Spotify account error. Premium subscription may be required.', true);
    });

    player.addListener('playback_error', ({ message }: any) => {
      console.error('Spotify playback error:', message);
      handleTrackError('Spotify playback failed. Skipping track...', true);
    });

    // Playback status updates
    player.addListener('player_state_changed', (state: any) => {
      console.log('Spotify player state changed:', state);
      if (state) {
        setIsPlaying(!state.paused);

        // Update progress tracking
        if (state.position !== undefined) {
          setCurrentTime(state.position / 1000); // Convert ms to seconds
        }
        if (state.duration !== undefined) {
          setDuration(state.duration / 1000); // Convert ms to seconds
        }

        // Spotify SDK supports seeking
        setIsSeekable(true);

        // Check if track has finished (position near end and paused)
        const trackEnded = state.paused &&
                          state.duration > 0 &&
                          state.position >= state.duration - 1000; // Within 1 second of end

        if (trackEnded) {
          console.log('Spotify track finished, playing next track');
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

      // Provide toggle and seek functions to parent
      props.onTogglePlay(() => togglePlay());
      if (props.onSeek) {
        props.onSeek((time: number) => seekToPosition(time));
      }
    });

    // Connect to the player!
    player.connect().then((success: boolean) => {
      if (success) {
        console.log('Successfully connected to Spotify Web Playback SDK');
      } else {
        console.error('Failed to connect to Spotify Web Playback SDK');
      }
    });
  };

  const togglePlay = async () => {
    console.log('Spotify togglePlay called');

    if (!playerReady()) {
      console.log('Spotify player not ready');
      return;
    }

    try {
      if (isPlaying()) {
        await player.pause();
        console.log('Paused Spotify playback');
      } else {
        await player.resume();
        console.log('Resumed Spotify playback');
      }
    } catch (error) {
      console.error('Error toggling Spotify playback:', error);
    }
  };

  const seekToPosition = async (timeInSeconds: number) => {
    console.log('Spotify seek to:', timeInSeconds);

    if (!playerReady()) {
      console.log('Spotify player not ready for seeking');
      return;
    }

    try {
      const positionMs = Math.floor(timeInSeconds * 1000);
      await player.seek(positionMs);
      console.log('Seeked to position:', positionMs, 'ms');
    } catch (error) {
      console.error('Error seeking in Spotify track:', error);
    }
  };

  const playSpotifyTrack = async (trackId: string, deviceIdValue: string) => {
    const token = spotifyAccessToken();
    if (!token) {
      console.error('No Spotify access token available');
      return;
    }

    try {
      console.log('Starting Spotify playback for track:', trackId, 'on device:', deviceIdValue);

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
        console.error('Spotify playback error:', response.status, errorData);

        if (response.status === 403 && errorData.error?.reason === 'PREMIUM_REQUIRED') {
          handleTrackError('Spotify Premium required. Skipping to next track...', true);
        } else if (response.status === 404) {
          handleTrackError('Spotify track not found or unavailable in your region', true);
        } else {
          handleTrackError(`Spotify playback error: ${response.status}`, true);
        }
        return;
      }

      console.log('Successfully started Spotify playback');
      // Don't set isPlaying here - wait for player_state_changed event
    } catch (error) {
      console.error('Error playing Spotify track:', error);
      handleTrackError('Failed to start Spotify playback', true);
    }
  };

  createEffect(() => {
    const track = currentTrack();
    const ready = playerReady();
    const device = deviceId();

    console.log('SpotifyMedia createEffect triggered:', {
      track: track?.title,
      source: track?.source,
      sourceId: track?.sourceId,
      playerReady: ready,
      deviceId: device,
      allConditionsMet: !!(track && track.source === 'spotify' && track.sourceId && ready && device)
    });

    if (track && track.source === 'spotify' && track.sourceId && ready && device) {
      console.log('✅ All conditions met - Loading Spotify track:', track.title, track.sourceId);
      playSpotifyTrack(track.sourceId, device);
    } else {
      console.log('❌ Waiting for conditions:', {
        hasTrack: !!track,
        isSpotifySource: track?.source === 'spotify',
        hasSourceId: !!track?.sourceId,
        playerReady: ready,
        hasDeviceId: !!device
      });
    }
  });

  return (
    <div class="bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex items-center justify-center">
      <i class="fab fa-spotify text-green-400 text-6xl sm:text-8xl"></i>
    </div>
  );
};

export default SpotifyMedia;