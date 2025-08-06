import { Component, Show, createEffect, createSignal, onMount, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../stores/playlistStore';
import { spotifyAccessToken } from '../stores/authStore';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
    spotifySDKReady: boolean;
  }
}

const SpotifyPlayer: Component = () => {
  let player: any;
  const [playerReady, setPlayerReady] = createSignal(false);
  const [deviceId, setDeviceId] = createSignal<string>('');
  
  onMount(() => {
    console.log('SpotifyPlayer onMount called');
    
    // Listen for the custom event
    const handleSDKReady = () => {
      console.log('Spotify SDK ready event received');
      initializeSpotifyPlayer();
    };
    
    // If SDK is already ready, initialize immediately
    if (window.spotifySDKReady && window.Spotify) {
      console.log('Spotify SDK already loaded and ready');
      initializeSpotifyPlayer();
    } else {
      // Otherwise, wait for the SDK to be ready
      console.log('Waiting for Spotify SDK to be ready...');
      window.addEventListener('spotify-sdk-ready', handleSDKReady);
    }
    
    // Cleanup
    onCleanup(() => {
      window.removeEventListener('spotify-sdk-ready', handleSDKReady);
    });
  });
  
  const initializeSpotifyPlayer = () => {
    const token = spotifyAccessToken();
    if (!token) {
      console.log('No Spotify access token available');
      return;
    }
    
    console.log('Initializing Spotify Web Playback SDK');
    player = new window.Spotify.Player({
      name: 'VIBES 95 Player',
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
      if (!state) return;
      
      console.log('Spotify player state changed:', state);
      setIsPlaying(!state.paused);
    });

    // Ready
    player.addListener('ready', ({ device_id }: any) => {
      console.log('Spotify player ready with Device ID:', device_id);
      setDeviceId(device_id);
      setPlayerReady(true);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }: any) => {
      console.log('Spotify player not ready with Device ID:', device_id);
      setPlayerReady(false);
    });

    // Connect to the player!
    player.connect();
  };
  
  createEffect(() => {
    const track = currentTrack();
    console.log('SpotifyPlayer createEffect triggered:', { 
      track: track?.title, 
      source: track?.source,
      sourceId: track?.sourceId,
      hasToken: !!spotifyAccessToken(),
      playerReady: playerReady(),
      deviceId: deviceId()
    });
    
    // Only handle Spotify tracks in this player
    if (track && track.source === 'spotify' && track.sourceId && spotifyAccessToken() && playerReady() && deviceId()) {
      console.log('Playing Spotify track:', track.title, track.sourceId);
      playSpotifyTrack(track.sourceId);
    } else if (track && track.source !== 'spotify') {
      console.log('Non-Spotify track selected, Spotify player will not load');
    }
  });
  
  const playSpotifyTrack = async (trackId: string) => {
    const token = spotifyAccessToken();
    if (!token || !deviceId()) return;
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId()}`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`]
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Spotify track started successfully');
    } catch (error) {
      console.error('Error playing Spotify track:', error);
    }
  };
  
  const togglePlay = async () => {
    if (!player || !playerReady()) {
      console.log('Spotify player not ready');
      return;
    }
    
    try {
      if (isPlaying()) {
        await player.pause();
        console.log('Spotify track paused');
      } else {
        await player.resume();
        console.log('Spotify track resumed');
      }
    } catch (error) {
      console.error('Error toggling Spotify playback:', error);
    }
  };
  
  return (
    <Show when={currentTrack() && currentTrack()?.source === 'spotify'}>
      <div class="w-80 border-l-2 border-gray-400 bg-gray-200 flex flex-col">
        {/* Player Header */}
        <div class="windows-titlebar p-2 flex justify-between items-center">
          <span><i class="fab fa-spotify mr-2 text-green-500"></i>Spotify Player</span>
          <div class="flex gap-1">
            <button class="win95-button w-6 h-4 text-xs font-bold text-black">_</button>
            <button class="win95-button w-6 h-4 text-xs font-bold text-black">×</button>
          </div>
        </div>
        
        <div class="flex-1 p-4 flex flex-col">
          {/* Spotify Player */}
          <div class="win95-panel p-2 mb-4">
            <div class="bg-black rounded">
              <div class="bg-green-500 text-white p-4 rounded">
                <div class="flex items-center justify-center mb-2">
                  <i class="fab fa-spotify text-2xl mr-2"></i>
                  <span class="font-bold">Spotify Premium</span>
                </div>
                <div class="text-center text-sm">
                  {playerReady() ? '🎵 Ready to Play' : '⏳ Connecting...'}
                </div>
                {deviceId() && (
                  <div class="text-xs text-center mt-1 opacity-75">
                    Device: VIBES 95 Player
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Track Info */}
          <div class="mb-4">
            <h3 class="font-bold text-black text-lg mb-1 leading-tight">
              {currentTrack()?.title}
            </h3>
            <p class="text-gray-600 mb-2">{currentTrack()?.artist}</p>
            <p class="text-sm text-gray-500">
              Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
            </p>
          </div>
          
          {/* Play Controls */}
          <div class="mb-4">
            <div class="flex justify-center mb-3">
              <button 
                onClick={togglePlay}
                class="win95-button w-16 h-16 flex items-center justify-center text-2xl"
              >
                <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            </div>
            
            {/* Player Status */}
            <div class="text-center">
              <div class="lcd-text inline-block px-3 py-1 text-sm">
                {playerReady() ? 
                  (isPlaying() ? '▶ PLAYING' : '⏸ PAUSED') : 
                  '⏳ LOADING...'
                }
              </div>
            </div>
          </div>
          
          {/* Track Actions */}
          <div class="space-y-2">
            <button class="win95-button w-full py-2 text-sm">
              <i class="fas fa-heart mr-2"></i>Like Track
            </button>
            <button class="win95-button w-full py-2 text-sm">
              <i class="fas fa-plus mr-2"></i>Add to Playlist
            </button>
            <button class="win95-button w-full py-2 text-sm">
              <i class="fas fa-share mr-2"></i>Share Track
            </button>
          </div>
          
          {/* Track Stats */}
          <div class="mt-4 pt-4 border-t border-gray-400">
            <div class="flex justify-between text-sm text-gray-600">
              <span><i class="fas fa-heart text-red-500"></i> {currentTrack()?.likes}</span>
              <span><i class="fas fa-comment"></i> {currentTrack()?.replies}</span>
              <span><i class="fas fa-retweet"></i> {currentTrack()?.recasts}</span>
            </div>
          </div>
          
          {/* Comment Preview */}
          <div class="mt-3 p-3 bg-white rounded border">
            <p class="text-sm text-gray-700 italic">
              "{currentTrack()?.comment}"
            </p>
            <p class="text-xs text-gray-500 mt-1">
              - {currentTrack()?.addedBy}, {currentTrack()?.timestamp}
            </p>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default SpotifyPlayer;