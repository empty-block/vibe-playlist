import { Component, Show, createEffect, onMount, createSignal } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../stores/playlistStore';

interface YouTubePlayerProps {
  isCompact?: () => boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayer: Component<YouTubePlayerProps> = (props) => {
  let player: any;
  let playerContainer: HTMLDivElement | undefined;
  const [playerReady, setPlayerReady] = createSignal(false);
  
  onMount(() => {
    console.log('YouTubePlayer onMount called');
    
    const checkAndInit = () => {
      console.log('Checking for container and YouTube API...', { 
        hasContainer: !!playerContainer,
        containerInDOM: playerContainer ? document.contains(playerContainer) : false,
        hasYT: !!window.YT,
        hasYTPlayer: !!(window.YT && window.YT.Player)
      });
      
      if (playerContainer && window.YT && window.YT.Player) {
        console.log('Both container and YouTube API ready, initializing player');
        initPlayer();
      } else {
        console.log('Still waiting for container or YouTube API...');
        setTimeout(checkAndInit, 500);
      }
    };
    
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready callback fired');
        setTimeout(checkAndInit, 100);
      };
    }
    
    setTimeout(checkAndInit, 1000);
  });
  
  const initPlayer = () => {
    console.log('initPlayer called', { 
      hasContainer: !!playerContainer, 
      containerInDOM: document.contains(playerContainer),
      hasPlayer: !!player, 
      hasYT: !!window.YT,
      hasYTPlayer: !!(window.YT && window.YT.Player)
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
      player = new window.YT.Player(playerContainer, {
        height: '240',
        width: '320',
        videoId: 'hTWKbfoikeg',
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
          enablejsapi: 1,
          playsinline: 1  // Critical for mobile playback
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
      videoId: track?.videoId,
      playerReady: playerReady(), 
      hasPlayer: !!player 
    });
    
    if (track && player && playerReady() && track.source === 'youtube' && track.sourceId) {
      console.log('Loading YouTube video:', track.title, track.sourceId);
      try {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // On mobile, cue the video instead of loading to prevent autoplay
          // User must tap play button to start
          player.cueVideoById({
            videoId: track.sourceId,
            startSeconds: 0
          });
          console.log('Mobile device detected - video cued, waiting for user interaction');
        } else {
          // On desktop, load and autoplay as before
          player.loadVideoById({
            videoId: track.sourceId,
            startSeconds: 0
          });
        }
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
  
  const isCompact = () => props.isCompact?.() ?? false;

  return (
    <Show when={currentTrack()}>
      <div class={`h-full bg-gray-200 ${isCompact() ? 'flex items-center px-2 sm:px-4 gap-2 sm:gap-4' : 'flex flex-col'} relative`}>
        
        {/* Desktop Header - Only show when not compact */}
        <Show when={!isCompact()}>
          <div class="windows-titlebar p-2 flex justify-between items-center">
            <span><i class="fas fa-play-circle mr-2"></i>Now Playing</span>
            <div class="flex gap-1">
              <button class="win95-button w-6 h-4 text-xs font-bold text-black">_</button>
              <button class="win95-button w-6 h-4 text-xs font-bold text-black">×</button>
            </div>
          </div>
        </Show>

        <div class={`${isCompact() ? 'contents' : 'flex-1 p-4 flex flex-col overflow-y-auto'}`}>
          
          {/* YouTube Player Area - Positioned differently per layout */}
          <div class={`${isCompact() ? 'flex-shrink-0' : 'win95-panel p-2 mb-4'} relative`}>
            <div class={`bg-black rounded overflow-hidden ${isCompact() ? 'w-32 h-20 sm:w-40 sm:h-24' : 'w-full h-48'}`}>
              <div 
                ref={(el) => {
                  playerContainer = el;
                  console.log('YouTube container ref set:', !!el);
                }} 
                class="w-full h-full"
                id="youtube-player-container"
              ></div>
            </div>
          </div>
          
          {/* Track Info */}
          <div class={`${isCompact() ? 'flex-1 min-w-0' : 'mb-4'}`}>
            <h3 class={`font-bold text-black leading-tight ${isCompact() ? 'text-xs sm:text-sm truncate' : 'text-lg mb-1'}`}>
              {currentTrack()?.title}
            </h3>
            <p class={`text-gray-600 truncate ${isCompact() ? 'text-xs' : 'mb-2'}`}>{currentTrack()?.artist}</p>
            <p class={`text-gray-500 ${isCompact() ? 'text-xs truncate hidden sm:block' : 'text-sm mb-3'}`}>
              Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
            </p>
            
            {/* Song Comment - Only show on desktop, moved up for prominence */}
            <Show when={!isCompact()}>
              <div class="p-3 bg-blue-50 rounded border-l-4 border-blue-400 mb-4">
                <p class="text-sm text-gray-700 italic font-medium">
                  "{currentTrack()?.comment}"
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {currentTrack()?.timestamp}
                </p>
              </div>
            </Show>
          </div>
          
          {/* Play Controls */}
          <div class={`${isCompact() ? 'flex items-center gap-1 sm:gap-2' : 'mb-4'}`}>
            <Show when={!isCompact()}>
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
            </Show>

            <Show when={isCompact()}>
              <button 
                onClick={togglePlay}
                class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-lg"
                disabled={!playerReady()}
              >
                <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            </Show>
          </div>
          
          {/* Track Stats */}
          <div class={`${isCompact() ? 'hidden sm:flex items-center gap-3 text-xs text-gray-600' : 'mt-4 pt-4 border-t border-gray-400'}`}>
            <Show when={!isCompact()}>
              <div class="flex justify-between text-sm text-gray-600">
                <span><i class="fas fa-heart text-red-500"></i> {currentTrack()?.likes}</span>
                <span><i class="fas fa-comment"></i> {currentTrack()?.replies}</span>
                <span><i class="fas fa-retweet"></i> {currentTrack()?.recasts}</span>
              </div>
            </Show>
            <Show when={isCompact()}>
              <span><i class="fas fa-heart text-red-500"></i> {currentTrack()?.likes}</span>
              <span><i class="fas fa-comment"></i> {currentTrack()?.replies}</span>
            </Show>
          </div>

          {/* Desktop-only sections */}
          <Show when={!isCompact()}>
            {/* Track Actions - Smaller and more compact */}
            <div class="flex gap-2 mt-4">
              <button class="win95-button flex-1 py-1 text-xs">
                <i class="fas fa-heart mr-1"></i>Like
              </button>
              <button class="win95-button flex-1 py-1 text-xs">
                <i class="fas fa-plus mr-1"></i>Add
              </button>
              <button class="win95-button flex-1 py-1 text-xs">
                <i class="fas fa-share mr-1"></i>Share
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default YouTubePlayer;