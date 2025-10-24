import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying, playNextTrack, setCurrentTime, setDuration, setIsSeekable } from '../../stores/playerStore';

interface YouTubeMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
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
  let progressInterval: number | undefined;
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
          enablejsapi: 1,
          playsinline: 1 // Required for iOS WebViews
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

    // Provide toggle and seek functions to parent
    props.onTogglePlay(() => togglePlay());
    if (props.onSeek) {
      props.onSeek((time: number) => seekToPosition(time));
    }

    // Enable seeking for YouTube
    setIsSeekable(true);

    // Start progress tracking
    startProgressTracking();

    console.log('YouTube player ready');
  };

  const seekToPosition = (timeInSeconds: number) => {
    if (!player || !playerReady()) {
      console.log('YouTube player not ready for seeking');
      return;
    }

    try {
      player.seekTo(timeInSeconds, true);
      console.log('Seeked to position:', timeInSeconds);
    } catch (error) {
      console.error('Error seeking in YouTube video:', error);
    }
  };

  const startProgressTracking = () => {
    // Clear any existing interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Update progress every 500ms when playing
    progressInterval = setInterval(() => {
      if (player && playerReady() && isPlaying()) {
        try {
          const current = player.getCurrentTime();
          const total = player.getDuration();

          if (current !== undefined && total !== undefined) {
            setCurrentTime(current);
            setDuration(total);
          }
        } catch (error) {
          // Silently fail - player might not be ready yet
        }
      }
    }, 500) as unknown as number;
  };
  
  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      console.log('YouTube track finished, playing next track');
      playNextTrack();
    }
  };

  // Cleanup interval on unmount
  onCleanup(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });
  
  const togglePlay = () => {
    console.log('togglePlay called:', {
      hasPlayer: !!player,
      playerReady: playerReady(),
      isPlaying: isPlaying(),
      playerState: player ? player.getPlayerState() : 'no player'
    });

    if (!player || !playerReady()) {
      console.log('Player not ready or not available');
      return;
    }

    try {
      const state = player.getPlayerState();
      console.log('Current player state:', state);

      if (isPlaying()) {
        console.log('Pausing video via pauseVideo()');
        player.pauseVideo();
      } else {
        console.log('Playing video via playVideo()');
        // Try to play
        player.playVideo().then(() => {
          console.log('playVideo() promise resolved');
        }).catch((err: any) => {
          console.error('playVideo() promise rejected:', err);
        });
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
        // Load video in paused state - user must manually tap play
        // This is due to WebView autoplay restrictions in Farcaster
        player.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });

        // Set playing state to false - user must manually start playback
        // Our controls will sync when user taps play (via onPlayerStateChange)
        setIsPlaying(false);
        console.log('YouTube video loaded in paused state - user must tap play to start');
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