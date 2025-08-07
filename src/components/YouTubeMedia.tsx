import { Component, createEffect, onMount, createSignal } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../stores/playlistStore';

interface YouTubeMediaProps {
  isCompact?: () => boolean;
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubeMedia: Component<YouTubeMediaProps> = (props) => {
  let player: any;
  let playerContainer: HTMLDivElement | undefined;
  const [playerReady, setPlayerReady] = createSignal(false);
  
  const isCompact = () => props.isCompact?.() ?? false;

  onMount(() => {
    console.log('YouTubeMedia onMount called');
    
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
    console.log('initPlayer called');
    
    if (!playerContainer || player || !window.YT?.Player) {
      return;
    }
    
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
    props.onPlayerReady(true);
    
    // Provide toggle function to parent
    props.onTogglePlay(() => togglePlay());
    
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
  
  createEffect(() => {
    const track = currentTrack();
    console.log('YouTubeMedia createEffect triggered:', { 
      track: track?.title, 
      source: track?.source,
      sourceId: track?.sourceId,
      playerReady: playerReady(), 
      hasPlayer: !!player 
    });
    
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
    }
  });

  return (
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
  );
};

export default YouTubeMedia;