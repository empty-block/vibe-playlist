import { Component, Show } from 'solid-js';
import { 
  isSpotifyAuthenticated, 
  spotifyUser, 
  spotifyAuthLoading,
  initiateSpotifyAuth, 
  disconnectSpotify 
} from '../stores/authStore';

const SpotifyConnectButton: Component = () => {
  return (
    <div class="win95-panel p-3 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="text-2xl">🎵</div>
          <div>
            <Show 
              when={isSpotifyAuthenticated()} 
              fallback={
                <div>
                  <div class="font-bold text-black text-sm">Spotify</div>
                  <div class="text-xs text-gray-600">Connect to play full tracks</div>
                </div>
              }
            >
              <div>
                <div class="font-bold text-black text-sm">
                  Connected to Spotify
                </div>
                <div class="text-xs text-gray-600">
                  Hey {spotifyUser()?.display_name || 'there'}! 👋
                </div>
              </div>
            </Show>
          </div>
        </div>
        
        <div>
          <Show 
            when={isSpotifyAuthenticated()} 
            fallback={
              <button 
                class="win95-button px-4 py-2 text-sm font-bold text-black"
                onClick={() => initiateSpotifyAuth()}
                disabled={spotifyAuthLoading()}
              >
                <Show when={spotifyAuthLoading()} fallback="🔗 Connect Spotify">
                  ⏳ Connecting...
                </Show>
              </button>
            }
          >
            <button 
              class="win95-button px-3 py-1 text-xs text-black"
              onClick={disconnectSpotify}
            >
              Disconnect
            </button>
          </Show>
        </div>
      </div>
      
      <Show when={!isSpotifyAuthenticated()}>
        <div class="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
          <div class="font-bold text-yellow-800 mb-1">💡 Spotify Premium Required</div>
          <div class="text-yellow-700">
            Connect your Spotify Premium account to play full tracks. 
            Free accounts can only play 30-second previews.
          </div>
        </div>
      </Show>
    </div>
  );
};

export default SpotifyConnectButton;