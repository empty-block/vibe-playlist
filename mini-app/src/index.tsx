import { render } from 'solid-js/web';
import sdk from '@farcaster/miniapp-sdk';
import App from './App';
import './styles/theme.css';
import './styles/window-layout.css';
import { handleSpotifyCallback, initializeAuth } from './stores/authStore';
import { restorePendingTrack } from './stores/playerStore';
import { initAnalytics, trackAppOpened } from './utils/analytics';
// Import theme store to initialize theme class on body immediately
import { theme } from './stores/themeStore';

// Initialize Farcaster SDK and render app
// The ready() call must happen before render to hide splash screen
const root = document.getElementById('root');

// Handle Spotify OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const spotifyCode = urlParams.get('code');
const spotifyError = urlParams.get('error');
const spotifyState = urlParams.get('state');

// Parse state parameter to extract pending track data
let pendingTrackData: any = null;
console.log('🔍 DEBUG - OAuth callback URL params:', {
  hasCode: !!spotifyCode,
  hasError: !!spotifyError,
  hasState: !!spotifyState
});

if (spotifyState) {
  try {
    console.log('🔍 DEBUG - Raw state parameter:', spotifyState);
    const stateData = JSON.parse(atob(spotifyState));
    console.log('🔍 DEBUG - Decoded state data:', stateData);
    pendingTrackData = stateData.pendingTrack || null;
    if (pendingTrackData) {
      console.log('✅ Pending track data found in OAuth state:', pendingTrackData);
    } else {
      console.log('⚠️ No pending track data in state parameter');
    }
  } catch (error) {
    console.error('❌ Failed to parse state parameter:', error);
  }
}

// Check if this window is a popup (opened by window.open)
const isPopup = window.opener && window.opener !== window;

if (spotifyCode) {
  console.log('Spotify authorization code detected');

  if (isPopup) {
    // If we're in a popup, send the code AND pending data to parent window via postMessage
    console.log('Sending auth code and pending data to parent window via postMessage');
    window.opener.postMessage(
      {
        type: 'spotify-auth-success',
        code: spotifyCode,
        pendingTrackData: pendingTrackData
      },
      window.location.origin
    );
    // Close the popup
    window.close();
  } else {
    // If we're not in a popup (direct redirect), handle normally
    console.log('Exchanging code for token...');

    // Store pending track IMMEDIATELY in sessionStorage before async token exchange
    // This survives within the SAME session/page load (not iframe reload)
    if (pendingTrackData) {
      sessionStorage.setItem('spotify_pending_track', JSON.stringify(pendingTrackData));
      console.log('✅ Stored pending track in sessionStorage for this page load');
    }

    handleSpotifyCallback(spotifyCode).then((success) => {
      if (success) {
        console.log('Spotify authentication successful!');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('Spotify authentication failed');
        // Clear on failure
        sessionStorage.removeItem('spotify_pending_track');
      }
    });
  }
} else if (spotifyError) {
  console.error('Spotify authorization error:', spotifyError);

  if (isPopup) {
    window.opener.postMessage(
      {
        type: 'spotify-auth-error',
        error: spotifyError
      },
      window.location.origin
    );
    window.close();
  } else {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Listen for messages from popup window
window.addEventListener('message', (event) => {
  // Verify the message is from our own origin for security
  if (event.origin !== window.location.origin) {
    console.warn('Received message from untrusted origin:', event.origin);
    return;
  }

  const data = event.data;

  if (data.type === 'spotify-auth-success' && data.code) {
    console.log('Received auth code from popup, exchanging for token...');

    // Store pending track IMMEDIATELY in sessionStorage
    if (data.pendingTrackData) {
      sessionStorage.setItem('spotify_pending_track', JSON.stringify(data.pendingTrackData));
      console.log('✅ Stored pending track from popup in sessionStorage');
    }

    handleSpotifyCallback(data.code).then((success) => {
      if (success) {
        console.log('Spotify authentication successful via popup!');
      } else {
        console.error('Spotify authentication failed');
        sessionStorage.removeItem('spotify_pending_track');
      }
    });
  } else if (data.type === 'spotify-auth-error') {
    console.error('Spotify authorization error from popup:', data.error);
  }
});

if (root) {
  // Initialize PostHog analytics
  initAnalytics();

  // Initialize auth state from localStorage and wait for it to complete
  initializeAuth().then(() => {
    console.log('Auth initialization complete');

    // Call ready() and then render
    // This is done synchronously to ensure ready() is called ASAP
    sdk.actions.ready()
      .then(async () => {
        console.log('Farcaster SDK ready called');

        // Enable Farcaster back navigation integration
        // This automatically shows/hides the back button based on browser history
        try {
          await sdk.back.enableWebNavigation();
          console.log('Farcaster back navigation enabled');
        } catch (error) {
          console.log('Farcaster back navigation not available:', error);
        }

        // Track app opened event
        trackAppOpened({
          is_farcaster_context: true,
          dev_mode: import.meta.env.DEV,
        });

        render(() => <App />, root);
      })
      .catch((error) => {
        console.log('Not in Farcaster context or SDK ready failed:', error);

        // Track app opened in non-Farcaster context
        trackAppOpened({
          is_farcaster_context: false,
          dev_mode: import.meta.env.DEV,
        });

        // Still render the app for local development
        render(() => <App />, root);
      });
  }).catch((error) => {
    console.error('Auth initialization failed:', error);
    // Still proceed to render even if auth init fails
    sdk.actions.ready()
      .then(async () => {
        console.log('Farcaster SDK ready called');

        // Enable Farcaster back navigation integration
        try {
          await sdk.back.enableWebNavigation();
          console.log('Farcaster back navigation enabled');
        } catch (error) {
          console.log('Farcaster back navigation not available:', error);
        }

        trackAppOpened({
          is_farcaster_context: true,
          dev_mode: import.meta.env.DEV,
        });

        render(() => <App />, root);
      })
      .catch((error) => {
        console.log('Not in Farcaster context or SDK ready failed:', error);

        trackAppOpened({
          is_farcaster_context: false,
          dev_mode: import.meta.env.DEV,
        });

        render(() => <App />, root);
      });
  });
}
