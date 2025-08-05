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
  let playerContainer: HTMLDivElement | undefined;
  const [playerReady, setPlayerReady] = createSignal(false);
  
  onMount(() => {
    console.log('YouTubePlayer onMount called');
    
    // Wait for the ref to be set and check for YouTube API
    const checkAndInit = () => {
      console.log('Checking for container and YouTube API...', { 
        hasContainer: !!playerContainer,
        containerInDOM: playerContainer ? document.contains(playerContainer) : false,
        hasYT: !!window.YT,
        hasYTPlayer: !!(window.YT && window.YT.Player)
      });
      
      // Make sure we have both the container and the API
      if (playerContainer && window.YT && window.YT.Player) {
        console.log('Both container and YouTube API ready, initializing player');
        initPlayer();
      } else {
        console.log('Still waiting for container or YouTube API...');
        // Keep checking until both are ready
        setTimeout(checkAndInit, 500);
      }
    };
    
    // Set up the global callback in case it hasn't fired yet
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready callback fired');
        // Small delay to ensure DOM is ready
        setTimeout(checkAndInit, 100);
      };
    }
    
    // Start checking after mount with longer delay to ensure ref is set
    setTimeout(checkAndInit, 1000);
  });
  
  const initPlayer = () => {
    console.log('initPlayer called', { 
      hasContainer: !!playerContainer, 
      containerInDOM: document.contains(playerContainer),
      hasPlayer: !!player, 
      hasYT: !!window.YT,
      hasYTPlayer: !!(window.YT && window.YT.Player),
      YTState: window.YT ? window.YT.PlayerState : 'YT not loaded'
    });
    
    if (!playerContainer) {
      console.error('No player container found');
      return;
    }
    
    if (player) {
      console.log('Player already exists, skipping initialization');
      return;
    }
    
    if (!window.YT || !window.YT.Player) {
      console.error('YouTube API not loaded');
      return;
    }
    
    console.log('All conditions met, creating YouTube player...');
    try {
      // YouTube API can accept a DOM element directly
      player = new window.YT.Player(playerContainer, {
        height: '240',
        width: '320',
        videoId: 'hTWKbfoikeg', // Start with a default video
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 0,
          origin: window.location.origin,
          enablejsapi: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
      console.log('YouTube player instance created successfully');
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }
  };
  
  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event.data);
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
    console.log('createEffect triggered:', { 
      track: track?.title, 
      source: track?.source,
      sourceId: track?.sourceId,
      videoId: track?.videoId, // Backward compatibility
      playerReady: playerReady(), 
      hasPlayer: !!player 
    });
    
    // Only handle YouTube tracks in this player
    if (track && player && playerReady() && track.source === 'youtube' && track.sourceId) {
      console.log('Loading YouTube video:', track.title, track.sourceId);
      try {
        player.loadVideoById({
          videoId: track.sourceId,
          startSeconds: 0
        });
      } catch (error) {
        console.error('Error loading video:', error);
      }
    } else if (track && track.source !== 'youtube') {
      console.log('Non-YouTube track selected, YouTube player will not load');
    }
  });
  
  const togglePlay = () => {
    console.log('togglePlay called:', { 
      hasPlayer: !!player, 
      playerReady: playerReady(), 
      isPlaying: isPlaying() 
    });
    
    if (!player || !playerReady()) {
      console.log('Player not ready or not available');
      return;
    }
    
    try {
      if (isPlaying()) {
        console.log('Pausing video');
        player.pauseVideo();
      } else {
        console.log('Playing video');
        player.playVideo();
      }
    } catch (error) {
      console.error('Error toggling play:', error);
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
          {/* YouTube Player */}
          <div class="win95-panel p-2 mb-4">
            <div class="bg-black rounded">
              <div 
                ref={(el) => {
                  playerContainer = el;
                  console.log('YouTube container ref set:', !!el);
                }} 
                class="w-full h-48"
                id="youtube-player-container"
              ></div>
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
            {/* Debug button - remove in production */}
            <button 
              class="win95-button w-full py-1 text-xs bg-yellow-200"
              onClick={() => console.log('Debug - Current track:', currentTrack(), 'Player ready:', playerReady(), 'Player:', !!player)}
            >
              Debug Player
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