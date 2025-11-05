import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../../stores/playerStore';
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

  const handleClick = () => {
    if (playerReady()) {
      togglePlay();
    }
  };

  return (
    <div
      class="bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
      onClick={handleClick}
      title={playerReady() ? (isPlaying() ? 'Pause' : 'Play on Spotify') : 'Loading...'}
      style={{
        'box-shadow': isPlaying()
          ? '0 0 20px rgba(0, 249, 42, 0.4)'
          : '0 0 10px rgba(29, 185, 84, 0.2)',
        'border': isPlaying()
          ? '2px solid rgba(0, 249, 42, 0.6)'
          : '2px solid rgba(29, 185, 84, 0.4)',
        'opacity': playerReady() ? '1' : '0.6'
      }}
    >
      <div class="text-center">
        <i class={`fab fa-spotify text-6xl sm:text-8xl transition-all duration-200 ${
          isPlaying() ? 'text-green-400 animate-pulse' : 'text-green-500'
        }`}></i>
        {playerReady() && (
          <div class="mt-2 text-xs sm:text-sm font-mono font-bold text-green-400 flex items-center justify-center gap-2">
            <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'} text-xs`}></i>
            <span>{isPlaying() ? 'PLAYING' : 'CLICK TO PLAY'}</span>
          </div>
        )}
        {!playerReady() && (
          <div class="mt-2 text-xs sm:text-sm font-mono text-green-600">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyMedia;