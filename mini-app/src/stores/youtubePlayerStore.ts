import { createSignal } from 'solid-js';

// Global YouTube player instance (preloaded)
let globalYouTubePlayer: any = null;
let globalPlayerContainer: HTMLDivElement | null = null;

// Signals for player state
export const [isYouTubePlayerReady, setIsYouTubePlayerReady] = createSignal(false);
export const [youtubePlayerError, setYoutubePlayerError] = createSignal<string | null>(null);

// Player configuration matching YouTubeMedia.tsx
const PLAYER_VARS = {
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
  playsinline: 1
};

/**
 * Initialize the global YouTube player (call once on app mount)
 * Creates a hidden player in a global container
 */
export const initializeGlobalYouTubePlayer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('[YouTubePlayerStore] Initializing global YouTube player...');

    // Check if already initialized
    if (globalYouTubePlayer) {
      console.log('[YouTubePlayerStore] Global player already exists');
      resolve();
      return;
    }

    // Create hidden container in body
    if (!globalPlayerContainer) {
      globalPlayerContainer = document.createElement('div');
      globalPlayerContainer.id = 'global-youtube-player-container';
      globalPlayerContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      `;
      document.body.appendChild(globalPlayerContainer);
      console.log('[YouTubePlayerStore] Created hidden container');
    }

    // Wait for YouTube API with timeout
    let checkAttempts = 0;
    const maxAttempts = 50; // 5 seconds max (50 * 100ms)

    const checkYouTubeAPI = () => {
      checkAttempts++;

      if (!window.YT || !window.YT.Player) {
        if (checkAttempts >= maxAttempts) {
          const error = new Error('YouTube API failed to load after 5 seconds');
          console.error('[YouTubePlayerStore]', error.message);
          setYoutubePlayerError(error.message);
          reject(error);
          return;
        }
        console.log(`[YouTubePlayerStore] Waiting for YouTube API... (attempt ${checkAttempts}/${maxAttempts})`);
        setTimeout(checkYouTubeAPI, 100);
        return;
      }

      try {
        console.log('[YouTubePlayerStore] Creating player instance...');
        // Create player instance - pass container ID, not DOM element
        globalYouTubePlayer = new window.YT.Player('global-youtube-player-container', {
          height: '100%',
          width: '100%',
          videoId: '', // Start empty
          playerVars: PLAYER_VARS,
          events: {
            onReady: () => {
              console.log('[YouTubePlayerStore] Player onReady fired, checking if container became iframe...');
              // YouTube API replaces the container element with an iframe
              // Check if the element with our ID is now an iframe
              let attempts = 0;
              const checkIframe = () => {
                const element = document.getElementById('global-youtube-player-container');
                const isIframe = element && element.tagName === 'IFRAME';
                if (isIframe) {
                  console.log('[YouTubePlayerStore] ✅ Global player ready - container replaced with iframe');
                  setIsYouTubePlayerReady(true);
                  setYoutubePlayerError(null);
                  resolve();
                } else if (attempts < 20) {
                  attempts++;
                  console.log(`[YouTubePlayerStore] Waiting for container to become iframe... (attempt ${attempts}/20)`);
                  setTimeout(checkIframe, 50);
                } else {
                  console.error('[YouTubePlayerStore] Container never became iframe after onReady');
                  reject(new Error('Container element not replaced by iframe'));
                }
              };
              checkIframe();
            },
            onError: (event: any) => {
              console.error('[YouTubePlayerStore] Player error:', event.data);
              setYoutubePlayerError(`Player error: ${event.data}`);
              reject(new Error(`YouTube player error: ${event.data}`));
            }
          }
        });
        console.log('[YouTubePlayerStore] Player instance created, waiting for onReady...');
      } catch (error) {
        console.error('[YouTubePlayerStore] Failed to create player:', error);
        setYoutubePlayerError('Failed to initialize player');
        reject(error);
      }
    };

    // Set up YouTube API ready callback if not already set
    if (!window.onYouTubeIframeAPIReady) {
      console.log('[YouTubePlayerStore] Setting up YouTube API ready callback');
      window.onYouTubeIframeAPIReady = () => {
        console.log('[YouTubePlayerStore] YouTube API ready callback fired');
        checkYouTubeAPI();
      };
    } else {
      console.log('[YouTubePlayerStore] YouTube API callback already set, checking now');
    }

    // Start checking immediately in case API is already loaded
    console.log('[YouTubePlayerStore] About to call checkYouTubeAPI() on line 121');
    checkYouTubeAPI();
  });
};

/**
 * Get the global YouTube player instance
 */
export const getGlobalYouTubePlayer = () => {
  return globalYouTubePlayer;
};

/**
 * Transfer the global player to a visible container
 * This moves the iframe from the hidden location to the visible one
 */
export const transferPlayerToContainer = (targetContainer: HTMLDivElement) => {
  if (!globalYouTubePlayer) {
    console.warn('[YouTubePlayerStore] Cannot transfer - no global player');
    return false;
  }

  try {
    // YouTube API replaces the container div with an iframe that has the same ID
    // Find the iframe by ID
    const iframe = document.getElementById('global-youtube-player-container');
    if (!iframe || iframe.tagName !== 'IFRAME') {
      console.warn('[YouTubePlayerStore] No iframe found with container ID');
      return false;
    }

    // Move iframe to target container
    targetContainer.innerHTML = '';
    targetContainer.appendChild(iframe);

    // Update iframe styles for visible container
    iframe.style.cssText = 'width: 100%; height: 100%;';

    console.log('[YouTubePlayerStore] Transferred player iframe to visible container');
    return true;
  } catch (error) {
    console.error('[YouTubePlayerStore] Error transferring player:', error);
    return false;
  }
};

/**
 * Transfer the player back to the hidden location
 */
export const transferPlayerToHiddenContainer = () => {
  if (!globalYouTubePlayer) {
    return;
  }

  try {
    // Find the iframe by ID (YouTube API gave it the container's ID)
    const iframe = document.getElementById('global-youtube-player-container');

    if (iframe && iframe.tagName === 'IFRAME') {
      // Move it back to body and apply hidden styles
      document.body.appendChild(iframe);
      iframe.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      `;
      console.log('[YouTubePlayerStore] Transferred player back to hidden location');
    }
  } catch (error) {
    console.error('[YouTubePlayerStore] Error returning player to hidden:', error);
  }
};

/**
 * Cleanup function for unmount
 */
export const destroyGlobalYouTubePlayer = () => {
  if (globalYouTubePlayer) {
    try {
      globalYouTubePlayer.destroy();
      console.log('[YouTubePlayerStore] Global player destroyed');
    } catch (error) {
      console.warn('[YouTubePlayerStore] Error destroying player:', error);
    }
    globalYouTubePlayer = null;
  }

  if (globalPlayerContainer && globalPlayerContainer.parentElement) {
    globalPlayerContainer.parentElement.removeChild(globalPlayerContainer);
    globalPlayerContainer = null;
    console.log('[YouTubePlayerStore] Global container removed');
  }

  setIsYouTubePlayerReady(false);
};
