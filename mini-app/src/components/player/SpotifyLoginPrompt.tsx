import { Component } from 'solid-js';
import { initiateSpotifyAuth } from '../../stores/authStore';

interface SpotifyLoginPromptProps {
  onFilterSpotify?: () => void;
}

const SpotifyLoginPrompt: Component<SpotifyLoginPromptProps> = (props) => {
  const handleLogin = () => {
    console.log('Initiating Spotify login...');
    initiateSpotifyAuth();
  };

  return (
    <div class="relative bg-gradient-to-br from-green-900 to-black rounded overflow-hidden w-56 h-44 sm:w-80 sm:h-52 flex flex-col items-center justify-center p-4">
      <div class="relative z-10 flex flex-col items-center justify-center gap-3 text-center">
        <i class="fab fa-spotify text-green-400 text-5xl"></i>

        <div class="text-white">
          <div class="font-bold text-sm">Spotify Login Required</div>
          <div class="text-xs opacity-75 mt-1">Connect your account to play Spotify tracks</div>
        </div>

        <button
          onClick={handleLogin}
          class="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center gap-2 mt-2"
        >
          <i class="fab fa-spotify"></i>
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default SpotifyLoginPrompt;
