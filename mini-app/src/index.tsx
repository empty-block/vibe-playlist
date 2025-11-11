import { render } from 'solid-js/web';
import sdk from '@farcaster/miniapp-sdk';
import App from './App';
import './styles/theme.css';
import './styles/window-layout.css';
import { handleSpotifyCallback, initializeAuth } from './stores/authStore';
import { restorePendingTrack } from './stores/playerStore';

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
    handleSpotifyCallback(spotifyCode).then((success) => {
      if (success) {
        console.log('Spotify authentication successful!');

        // KEEP pending track data in URL hash so it survives iframe reload
        if (pendingTrackData) {
          const hashData = `#pending_track=${encodeURIComponent(JSON.stringify(pendingTrackData))}`;
          window.history.replaceState({}, document.title, window.location.pathname + hashData);
          console.log('✅ Stored pending track in URL hash:', hashData);
        } else {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        console.error('Spotify authentication failed');
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
    handleSpotifyCallback(data.code).then((success) => {
      if (success) {
        console.log('Spotify authentication successful via popup!');

        // KEEP pending track data in URL hash so it survives iframe reload
        if (data.pendingTrackData) {
          console.log('📦 Storing pending track data from popup:', data.pendingTrackData);
          const hashData = `#pending_track=${encodeURIComponent(JSON.stringify(data.pendingTrackData))}`;
          window.history.replaceState({}, document.title, window.location.pathname + hashData);
          console.log('✅ Stored pending track in URL hash:', hashData);
        }
      } else {
        console.error('Spotify authentication failed');
      }
    });
  } else if (data.type === 'spotify-auth-error') {
    console.error('Spotify authorization error from popup:', data.error);
  }
});

if (root) {
  // Initialize auth state from localStorage and wait for it to complete
  initializeAuth().then(() => {
    console.log('Auth initialization complete');

    // Call ready() and then render
    // This is done synchronously to ensure ready() is called ASAP
    sdk.actions.ready()
      .then(() => {
        console.log('Farcaster SDK ready called');
        render(() => <App />, root);
      })
      .catch((error) => {
        console.log('Not in Farcaster context or SDK ready failed:', error);
        // Still render the app for local development
        render(() => <App />, root);
      });
  }).catch((error) => {
    console.error('Auth initialization failed:', error);
    // Still proceed to render even if auth init fails
    sdk.actions.ready()
      .then(() => {
        console.log('Farcaster SDK ready called');
        render(() => <App />, root);
      })
      .catch((error) => {
        console.log('Not in Farcaster context or SDK ready failed:', error);
        render(() => <App />, root);
      });
  });
}
