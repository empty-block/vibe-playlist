import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying, setCurrentTime, setDuration, setIsSeekable, playNextTrack, handleTrackError } from '../../stores/playerStore';

interface SoundCloudMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
  onPlaybackStarted?: (hasStarted: boolean) => void;
  onPause?: (pauseFn: () => void) => void;
}

declare global {
  interface Window {
    SC: any;
  }
}

const SoundCloudMedia: Component<SoundCloudMediaProps> = (props) => {
  let widget: any;
  let iframeElement: HTMLIFrameElement | undefined;
  let loadTimeoutId: number | undefined;
  const [playerReady, setPlayerReady] = createSignal(false);
  const [currentTrackId, setCurrentTrackId] = createSignal<string>('');
  const [isLoadingTrack, setIsLoadingTrack] = createSignal(false);
  const [hasStartedPlayback, setHasStartedPlayback] = createSignal(false);

  // Load SoundCloud Widget API
  onMount(() => {
    console.log('SoundCloudMedia onMount called');

    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => {
        console.log('SoundCloud Widget API loaded');
        initializeWidget();
      };
      document.body.appendChild(script);

      onCleanup(() => {
        document.body.removeChild(script);
      });
    } else {
      initializeWidget();
    }
  });

  const initializeWidget = () => {
    if (!iframeElement || !window.SC) {
      console.log('SoundCloud: Waiting for iframe or SC API');
      setTimeout(initializeWidget, 100);
      return;
    }

    console.log('Initializing SoundCloud Widget...');
    widget = window.SC.Widget(iframeElement);

    // Bind events
    widget.bind(window.SC.Widget.Events.READY, () => {
      console.log('SoundCloud widget ready');
      setPlayerReady(true);
      props.onPlayerReady(true);

      // Provide toggle and seek functions to parent
      props.onTogglePlay(() => togglePlay());
      if (props.onSeek) {
        props.onSeek((time: number) => seekToPosition(time));
      }
      if (props.onPause) {
        props.onPause(() => pauseSoundCloud());
      }

      // Enable seeking
      setIsSeekable(true);
    });

    widget.bind(window.SC.Widget.Events.PLAY, () => {
      console.log('SoundCloud track playing');
      setIsPlaying(true);
      // Mark that playback has started at least once
      const wasFirstPlay = !hasStartedPlayback();
      setHasStartedPlayback(true);
      if (props.onPlaybackStarted && wasFirstPlay) {
        props.onPlaybackStarted(true);
      }
    });

    widget.bind(window.SC.Widget.Events.PAUSE, () => {
      console.log('SoundCloud track paused');
      setIsPlaying(false);
    });

    widget.bind(window.SC.Widget.Events.FINISH, () => {
      console.log('SoundCloud track finished, playing next track');
      setIsPlaying(false);
      playNextTrack();
    });

    widget.bind(window.SC.Widget.Events.ERROR, () => {
      // Ignore errors during initialization or loading
      // SoundCloud Widget API sometimes fires spurious ERROR events that resolve on their own
      if (isLoadingTrack()) {
        console.warn('SoundCloud error during track load (ignored - waiting for final state)');
      } else {
        console.warn('SoundCloud error during initialization (ignored)');
      }
    });

    widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
      // Update progress (data contains currentPosition in ms and relativePosition 0-1)
      if (data.currentPosition !== undefined) {
        setCurrentTime(data.currentPosition / 1000); // Convert ms to seconds
      }
    });

    // Get duration when track loads
    widget.bind(window.SC.Widget.Events.READY, () => {
      widget.getDuration((duration: number) => {
        setDuration(duration / 1000); // Convert ms to seconds
      });
    });
  };

  const pauseSoundCloud = () => {
    console.log('[SoundCloudMedia] Pause requested');

    if (!playerReady() || !widget) {
      console.log('[SoundCloudMedia] No active widget to pause');
      return;
    }

    try {
      console.log('[SoundCloudMedia] Pausing SoundCloud widget');
      widget.pause();
    } catch (error) {
      console.error('Error pausing SoundCloud widget:', error);
    }
  };

  const togglePlay = () => {
    console.log('SoundCloud togglePlay called');

    if (!playerReady() || !widget) {
      console.log('SoundCloud widget not ready');
      return;
    }

    widget.isPaused((paused: boolean) => {
      if (paused) {
        widget.play();
      } else {
        widget.pause();
      }
    });
  };

  const seekToPosition = (timeInSeconds: number) => {
    console.log('SoundCloud seek to:', timeInSeconds);

    if (!playerReady() || !widget) {
      console.log('SoundCloud widget not ready for seeking');
      return;
    }

    const positionMs = Math.floor(timeInSeconds * 1000);
    widget.seekTo(positionMs);
  };

  const loadTrack = async (trackIdOrUrl: string) => {
    if (!widget) {
      console.warn('SoundCloud widget not initialized, cannot load track');
      return;
    }

    if (!playerReady()) {
      console.warn('SoundCloud widget not ready, waiting...');
      // Wait for widget to be ready before loading
      const checkReady = setInterval(() => {
        if (playerReady()) {
          clearInterval(checkReady);
          loadTrack(trackIdOrUrl); // Retry once ready
        }
      }, 100);
      // Timeout after 5 seconds
      setTimeout(() => clearInterval(checkReady), 5000);
      return;
    }

    // Handle various SoundCloud URL formats from database
    let trackUrl: string;
    if (trackIdOrUrl.startsWith('http')) {
      // Check if it's a shortened URL that needs resolving
      if (trackIdOrUrl.includes('on.soundcloud.com/')) {
        console.log('Resolving shortened SoundCloud URL:', trackIdOrUrl);
        try {
          // Use SoundCloud's oEmbed API to get the API URL
          const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(trackIdOrUrl)}`;
          const response = await fetch(oembedUrl);
          const data = await response.json();

          // Extract the API URL from the HTML iframe src
          // The oEmbed response contains an iframe with the player URL
          if (data && data.html) {
            const urlMatch = data.html.match(/url=([^&"]+)/);
            if (urlMatch) {
              trackUrl = decodeURIComponent(urlMatch[1]);
              console.log('Resolved to API URL:', trackUrl);
            } else {
              // Fallback to the original URL
              trackUrl = trackIdOrUrl;
            }
          } else {
            // Fallback to the original URL
            trackUrl = trackIdOrUrl;
          }
        } catch (error) {
          console.warn('Failed to resolve shortened URL, using original:', error);
          trackUrl = trackIdOrUrl;
        }
      } else {
        // Already a full canonical URL
        trackUrl = trackIdOrUrl;
      }
    } else if (trackIdOrUrl.includes('/')) {
      // Path format like "artist/track-name" (from database 'platform_id')
      trackUrl = `https://soundcloud.com/${trackIdOrUrl}`;
    } else {
      // Short code like "9TR1vylR2yvlrM3lwC" (from database 'platform_id')
      // Try to resolve it first
      const shortUrl = `https://on.soundcloud.com/${trackIdOrUrl}`;
      try {
        console.log('Resolving short code:', shortUrl);
        const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(shortUrl)}`;
        const response = await fetch(oembedUrl);
        const data = await response.json();

        // Extract the API URL from the HTML iframe src
        if (data && data.html) {
          const urlMatch = data.html.match(/url=([^&"]+)/);
          if (urlMatch) {
            trackUrl = decodeURIComponent(urlMatch[1]);
            console.log('Resolved short code to API URL:', trackUrl);
          } else {
            trackUrl = shortUrl;
          }
        } else {
          trackUrl = shortUrl;
        }
      } catch (error) {
        console.warn('Failed to resolve short code, using short URL:', error);
        trackUrl = shortUrl;
      }
    }

    console.log('Loading SoundCloud track:', trackUrl);
    setIsLoadingTrack(true);

    // Clear any existing timeout
    if (loadTimeoutId !== undefined) {
      clearTimeout(loadTimeoutId);
    }

    // Set a timeout to handle genuine failures (10 seconds)
    loadTimeoutId = setTimeout(() => {
      if (isLoadingTrack()) {
        console.error('SoundCloud track failed to load (timeout)');
        handleTrackError('SoundCloud track unavailable. Skipping...', true);
        setIsLoadingTrack(false);
      }
    }, 10000) as unknown as number;

    widget.load(trackUrl, {
      auto_play: true,
      callback: () => {
        console.log('SoundCloud track loaded successfully');
        setIsLoadingTrack(false);
        // Clear the timeout since we loaded successfully
        if (loadTimeoutId !== undefined) {
          clearTimeout(loadTimeoutId);
          loadTimeoutId = undefined;
        }
        // Update duration after load
        widget.getDuration((duration: number) => {
          setDuration(duration / 1000);
        });
      }
    });
  };

  createEffect(() => {
    const track = currentTrack();
    const isReady = playerReady(); // Explicitly track playerReady as a dependency

    console.log('SoundCloudMedia createEffect triggered:', {
      track: track?.title,
      source: track?.source,
      sourceId: track?.sourceId,
      url: track?.url,
      playerReady: isReady
    });

    if (track && track.source === 'soundcloud' && isReady) {
      // Prefer full URL over sourceId for more reliable playback
      const trackIdentifier = track.url || track.sourceId;

      if (!trackIdentifier) {
        console.error('SoundCloud track missing both url and sourceId:', track.title);
        return;
      }

      // Only load if it's a different track
      if (currentTrackId() !== trackIdentifier) {
        console.log('Loading new SoundCloud track:', track.title, 'using:', trackIdentifier);
        setCurrentTrackId(trackIdentifier);
        // Reset playback started for new track
        setHasStartedPlayback(false);
        if (props.onPlaybackStarted) {
          props.onPlaybackStarted(false);
        }
        loadTrack(trackIdentifier);
      }
    }
  });

  // Get initial track URL for iframe src
  // NOTE: We don't load a specific track here because we need to resolve shortened URLs asynchronously
  // The actual track will be loaded via widget.load() after the widget is ready
  const getInitialIframeSrc = () => {
    // Always start with an empty player - we'll load the track via widget.load() after initialization
    return 'https://w.soundcloud.com/player/?url=&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false';
  };

  return (
    <div class="w-full flex items-center justify-center bg-gradient-to-br from-orange-900 to-black rounded overflow-hidden" style={{ "max-height": "300px" }}>
      {/* SoundCloud player - shows single tracks or playlists with proper attribution */}
      <iframe
        ref={iframeElement!}
        width="100%"
        height="100%"
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        src={getInitialIframeSrc()}
        style={{ border: 'none', 'min-height': '166px', 'max-height': '300px' }}
      ></iframe>
    </div>
  );
};

export default SoundCloudMedia;
