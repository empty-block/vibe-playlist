import { Component, createEffect, onMount, createSignal, onCleanup } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying, setCurrentTime, setDuration, setIsSeekable, playNextTrack, handleTrackError } from '../../stores/playerStore';

interface SoundCloudMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
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
  const [playerReady, setPlayerReady] = createSignal(false);
  const [currentTrackId, setCurrentTrackId] = createSignal<string>('');

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
      console.error('SoundCloud playback error');
      handleTrackError('SoundCloud track unavailable. Skipping...', true);
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

  const loadTrack = (trackIdOrUrl: string) => {
    if (!widget || !playerReady()) {
      console.log('SoundCloud widget not ready to load track');
      return;
    }

    // Handle various SoundCloud URL formats from database
    let trackUrl: string;
    if (trackIdOrUrl.startsWith('http')) {
      // Already a full URL (from database 'url' column)
      trackUrl = trackIdOrUrl;
    } else if (trackIdOrUrl.includes('/')) {
      // Path format like "artist/track-name" (from database 'platform_id')
      trackUrl = `https://soundcloud.com/${trackIdOrUrl}`;
    } else {
      // Short code like "9TR1vylR2yvlrM3lwC" (from database 'platform_id')
      trackUrl = `https://on.soundcloud.com/${trackIdOrUrl}`;
    }

    console.log('Loading SoundCloud track:', trackUrl);

    widget.load(trackUrl, {
      auto_play: true,
      callback: () => {
        console.log('SoundCloud track loaded successfully');
        // Update duration after load
        widget.getDuration((duration: number) => {
          setDuration(duration / 1000);
        });
      }
    });
  };

  createEffect(() => {
    const track = currentTrack();
    console.log('SoundCloudMedia createEffect triggered:', {
      track: track?.title,
      source: track?.source,
      sourceId: track?.sourceId,
      playerReady: playerReady()
    });

    if (track && track.source === 'soundcloud' && track.sourceId && playerReady()) {
      // Only load if it's a different track
      if (currentTrackId() !== track.sourceId) {
        console.log('Loading new SoundCloud track:', track.title, track.sourceId);
        setCurrentTrackId(track.sourceId);
        loadTrack(track.sourceId);
      }
    }
  });

  // Get initial track URL for iframe src
  const getInitialIframeSrc = () => {
    const track = currentTrack();
    if (track && track.source === 'soundcloud' && track.sourceId) {
      // Handle various SoundCloud URL formats from database
      let trackUrl: string;
      if (track.sourceId.startsWith('http')) {
        // Already a full URL (from database 'url' column)
        trackUrl = track.sourceId;
      } else if (track.sourceId.includes('/')) {
        // Path format like "artist/track-name" (from database 'platform_id')
        trackUrl = `https://soundcloud.com/${track.sourceId}`;
      } else {
        // Short code like "9TR1vylR2yvlrM3lwC" (from database 'platform_id')
        trackUrl = `https://on.soundcloud.com/${track.sourceId}`;
      }

      // URL encode the track URL
      const encodedUrl = encodeURIComponent(trackUrl);
      // Use compact visual player that shows only the current track
      // visual=false gives us the compact player without artwork
      // This respects SoundCloud's attribution requirements while being minimal
      return `https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false`;
    }
    // Default empty player
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
