import { Component, createEffect, onMount, createSignal } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../../stores/playerStore';

interface YouTubeMediaProps {
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
  
  // Always use compact size for bottom bar

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
        height: '100%',
        width: '100%',
        videoId: '', // Start without a video, will load via createEffect
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
      console.log('YouTube player instance created successfully without initial video');
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
  
  // Track seeking state separately from play/pause
  let isSeeking = false;
  let seekingTimeout: number | undefined;

  const onPlayerStateChange = (event: any) => {
    console.log('[YouTubeMedia] State change:', event.data, {
      PLAYING: window.YT.PlayerState.PLAYING,
      PAUSED: window.YT.PlayerState.PAUSED,
      BUFFERING: window.YT.PlayerState.BUFFERING,
      ENDED: window.YT.PlayerState.ENDED,
      isSeeking
    });

    if (event.data === window.YT.PlayerState.PLAYING) {
      // Clear seeking state
      isSeeking = false;
      if (seekingTimeout) {
        clearTimeout(seekingTimeout);
        seekingTimeout = undefined;
      }
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      // Buffering means we're seeking or loading - stay visible
      console.log('[YouTubeMedia] Buffering - marking as seeking');
      isSeeking = true;
      // Keep player visible during seeking/buffering
      if (!isPlaying()) {
        setIsPlaying(true);
      }
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      // Don't immediately hide - might be seeking
      // Give buffering state 50ms to fire
      if (seekingTimeout) {
        clearTimeout(seekingTimeout);
      }
      seekingTimeout = setTimeout(() => {
        // If we didn't enter buffering/seeking state, this is a real pause
        if (!isSeeking) {
          console.log('[YouTubeMedia] Real pause detected, hiding player');
          setIsPlaying(false);
        } else {
          console.log('[YouTubeMedia] Pause during seeking, keeping visible');
        }
        seekingTimeout = undefined;
      }, 50) as unknown as number;
    } else if (event.data === window.YT.PlayerState.ENDED) {
      isSeeking = false;
      if (seekingTimeout) {
        clearTimeout(seekingTimeout);
        seekingTimeout = undefined;
      }
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
      fullTrack: track,
      playerReady: playerReady(), 
      hasPlayer: !!player 
    });
    
    if (track && player && playerReady() && track.source === 'youtube' && track.sourceId) {
      // Extract YouTube video ID from URL if sourceId is a full URL
      const getVideoId = (url: string) => {
        // Handle various YouTube URL formats
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
          /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        return url; // Return as-is if no pattern matches
      };
      
      const videoId = getVideoId(track.sourceId);
      console.log('Loading YouTube video:', track.title, 'Original sourceId:', track.sourceId, 'Extracted videoId:', videoId);
      
      try {
        player.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  });

  return (
    <div class="w-full h-full">
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