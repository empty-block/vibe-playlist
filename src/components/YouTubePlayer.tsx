import { Component, Show, createEffect, onMount, createSignal } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../stores/playlistStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayer: Component = () => {
  let player: any;
  let playerContainer: HTMLDivElement;
  const [playerReady, setPlayerReady] = createSignal(false);
  
  onMount(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load YouTube IFrame API if not already loaded
      if (!document.querySelector('script[src*="iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }
  });
  
  const initPlayer = () => {
    if (playerContainer && !player) {
      player = new window.YT.Player(playerContainer, {
        height: '240',
        width: '320',
        videoId: '',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }
  };
  
  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    console.log('YouTube player ready');
  };
  
  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED || 
               event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };
  
  createEffect(() => {
    const track = currentTrack();
    if (track && player && playerReady() && track.videoId) {
      console.log('Loading video:', track.title, track.videoId);
      player.loadVideoById(track.videoId);
    }
  });
  
  const togglePlay = () => {
    if (!player || !playerReady()) return;
    
    if (isPlaying()) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };
  
  return (
    <Show when={currentTrack()}>
      <div class="w-80 border-l-2 border-gray-400 bg-gray-200 flex flex-col">
        {/* Player Header */}
        <div class="windows-titlebar p-2 flex justify-between items-center">
          <span><i class="fas fa-play-circle mr-2"></i>Now Playing</span>
          <div class="flex gap-1">
            <button class="win95-button w-6 h-4 text-xs font-bold text-black">_</button>
            <button class="win95-button w-6 h-4 text-xs font-bold text-black">×</button>
          </div>
        </div>
        
        <div class="flex-1 p-4 flex flex-col">
          {/* Track Info */}
          <div class="mb-4">
            <img 
              src={currentTrack()?.thumbnail} 
              alt={currentTrack()?.title}
              class="w-full h-48 object-cover rounded mb-3"
            />
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
                disabled={!playerReady()}
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
          
          {/* YouTube Player (Compact) */}
          <div class="win95-panel p-2 mb-4">
            <div class="bg-black rounded">
              <div ref={playerContainer!} id="youtube-player" class="w-full"></div>
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

export default YouTubePlayer;