import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying, playNextTrack, setCurrentTime, setDuration, setIsSeekable } from '../../stores/playerStore';
import { isInFarcasterSync } from '../../stores/farcasterStore';

interface YouTubeMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
  onPlaybackStarted?: (hasStarted: boolean) => void;
  onPause?: (pauseFn: () => void) => void;
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
  const [userHasInteracted, setUserHasInteracted] = createSignal(false);
  const [hasStartedPlayback, setHasStartedPlayback] = createSignal(false);

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

    // Set Permissions-Policy on the YouTube iframe to prevent warnings
    const iframe = playerContainer?.querySelector('iframe');
    if (iframe) {
      // Explicitly permit what YouTube needs and deny what it doesn't
      iframe.setAttribute('allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; ' +
        'geolocation \'none\'; microphone \'none\'; camera \'none\''
      );
      console.log('Set Permissions-Policy on YouTube iframe');
    }

    // Provide toggle and seek functions to parent
    props.onTogglePlay(() => togglePlay());
    if (props.onSeek) {
      props.onSeek((time: number) => seekToPosition(time));
    }
    if (props.onPause) {
      props.onPause(() => pauseYouTube());
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
      // Mark that user has interacted (either via YouTube controls or app controls)
      setUserHasInteracted(true);
      // Mark that playback has started at least once
      setHasStartedPlayback(true);
      if (props.onPlaybackStarted) {
        props.onPlaybackStarted(true);
      }
      startProgressTracking();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      console.log('YouTube track finished, playing next track');
      playNextTrack();
    }
  };

  // Cleanup interval and player on unmount
  onCleanup(() => {
    console.log('YouTubeMedia cleanup - destroying player');

    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Destroy YouTube player to prevent memory leaks and API errors
    if (player) {
      try {
        player.destroy();
        console.log('YouTube player destroyed successfully');
      } catch (error) {
        console.warn('Error destroying YouTube player:', error);
      }
      player = null;
    }
  });
  
  const pauseYouTube = () => {
    console.log('[YouTubeMedia] Pause requested');

    if (!player || !playerReady()) {
      console.log('[YouTubeMedia] No active player to pause');
      return;
    }

    try {
      console.log('[YouTubeMedia] Pausing YouTube video');
      player.pauseVideo();
    } catch (error) {
      console.error('Error pausing YouTube video:', error);
    }
  };

  const togglePlay = () => {
    console.log('togglePlay called:', {
      hasPlayer: !!player,
      playerReady: playerReady(),
      isPlaying: isPlaying(),
      playerState: player ? player.getPlayerState() : 'no player',
      userHasInteracted: userHasInteracted()
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
        // User clicking our play button IS a valid user interaction
        // Mark interaction before playing to prevent any race conditions
        const farcasterCheck = isInFarcasterSync();
        if (farcasterCheck === true) {
          setUserHasInteracted(true);
        }
        // playVideo() is a void function, not a Promise
        player.playVideo();
      }
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };
  
  createEffect(() => {
    const track = currentTrack();
    console.log('[YouTubeMedia] createEffect triggered:', {
      track: track?.title,
      source: track?.source,
      sourceId: track?.sourceId,
      playerReady: playerReady(),
      hasPlayer: !!player,
      userHasInteracted: userHasInteracted()
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
      console.log('[YouTubeMedia] Loading YouTube video:', track.title, 'videoId:', videoId);

      try {
        // Reset playback flags for new track
        setHasStartedPlayback(false);
        if (props.onPlaybackStarted) {
          props.onPlaybackStarted(false);
        }

        // Always cue video without autoplay - user must click play button
        console.log('[YouTubeMedia] Cuing video (two-click pattern):', videoId);
        player.cueVideoById({
          videoId: videoId,
          startSeconds: 0
        });

        // Set playing to false so play button is shown
        setIsPlaying(false);
      } catch (error) {
        console.error('[YouTubeMedia] Error loading video:', error);
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