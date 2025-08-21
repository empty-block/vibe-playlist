import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../../stores/playlistStore';
import { spotifyAccessToken } from '../../stores/authStore';

interface SpotifyMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
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

  onMount(() => {
    console.log('SpotifyMedia onMount called');
    
    const handleSDKReady = () => {
      console.log('Spotify SDK ready event received');
      initializeSpotifyPlayer();
    };
    
    createEffect(() => {
      const token = spotifyAccessToken();
      if (token && !window.Spotify && !window.spotifySDKReady) {
        console.log('Loading Spotify SDK for authenticated user...');
        window.loadSpotifySDK().catch(console.error);
      }
    });
    
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
    });

    player.addListener('authentication_error', ({ message }: any) => {
      console.error('Spotify authentication error:', message);
    });

    player.addListener('account_error', ({ message }: any) => {
      console.error('Spotify account error:', message);
    });

    player.addListener('playback_error', ({ message }: any) => {
      console.error('Spotify playback error:', message);
    });

    // Playback status updates
    player.addListener('player_state_changed', (state: any) => {
      console.log('Spotify player state changed:', state);
      if (state) {
        setIsPlaying(!state.paused);
      }
    });

    // Ready
    player.addListener('ready', ({ device_id }: any) => {
      console.log('Spotify player ready with Device ID:', device_id);
      setDeviceId(device_id);
      setPlayerReady(true);
      props.onPlayerReady(true);
      
      // Provide toggle function to parent
      props.onTogglePlay(() => togglePlay());
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

  createEffect(() => {
    const track = currentTrack();
    console.log('SpotifyMedia createEffect triggered:', {
      track: track?.title,
      source: track?.source,
      sourceId: track?.sourceId,
      playerReady: playerReady(),
      deviceId: deviceId()
    });

    if (track && track.source === 'spotify' && track.sourceId && playerReady() && deviceId()) {
      console.log('Loading Spotify track:', track.title, track.sourceId);
      // Here you would implement Spotify track loading logic
      // This would involve making API calls to start playback
    }
  });

  return (
    <div class="bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex items-center justify-center">
      <i class="fab fa-spotify text-green-400 text-6xl sm:text-8xl"></i>
    </div>
  );
};

export default SpotifyMedia;