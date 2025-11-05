import { createSignal } from 'solid-js';
import { getSpotifyAuthURL, SPOTIFY_CONFIG } from '../config/spotify';

// Current user state (mock for now - would come from Farcaster in real app)
export const [currentUser, setCurrentUser] = createSignal({
  username: 'hendrix_69',
  avatar: 'https://cdn-p.smehost.net/sites/7072b26066004910853871410c44e9f1/wp-content/uploads/2017/12/171207_hendrix-bsots_525px.jpg',
  displayName: 'Jimi'
});

// General authentication state (mock - for demo purposes)
// In real app this would check Farcaster authentication
// DEFAULT TO TRUE FOR DEVELOPMENT
export const [isAuthenticated, setIsAuthenticated] = createSignal(
  localStorage.getItem('demo_authenticated') !== 'false' // Default to true unless explicitly set to false
);

// Demo function to toggle authentication for testing
export const toggleDemoAuth = () => {
  const newState = !isAuthenticated();
  setIsAuthenticated(newState);
  localStorage.setItem('demo_authenticated', newState.toString());
};

// Spotify authentication state
export const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = createSignal(false);
export const [spotifyAccessToken, setSpotifyAccessToken] = createSignal<string | null>(null);
export const [spotifyUser, setSpotifyUser] = createSignal<any>(null);
export const [spotifyAuthLoading, setSpotifyAuthLoading] = createSignal(false);

// Helper function to check if user can play a track
export const canPlayTrack = (source: string): boolean => {
  const result = (() => {
    switch (source) {
      case 'youtube':
        return true; // YouTube always works
      case 'spotify':
        return isSpotifyAuthenticated(); // Requires Spotify auth
      case 'soundcloud':
        return true; // SoundCloud generally works without auth
      default:
        return false;
    }
  })();
  
  console.log('canPlayTrack Debug:', {
    source,
    result,
    isSpotifyAuth: isSpotifyAuthenticated()
  });
  
  return result;
};

// Spotify authentication functions
export const initiateSpotifyAuth = async (pendingTrack?: any) => {
  // Clean up any stale auth data before starting new auth flow
  localStorage.removeItem('spotify_auth_initiated');
  localStorage.removeItem('spotify_code_verifier');

  const authURL = await getSpotifyAuthURL();

  // Store the current state to handle redirect
  localStorage.setItem('spotify_auth_initiated', 'true');

  // Store pending track if provided, so we can restore it after auth
  if (pendingTrack) {
    localStorage.setItem('spotify_pending_track', JSON.stringify(pendingTrack));
  }

  // Redirect to Spotify authorization
  window.location.href = authURL;
};

// Get and clear pending track from localStorage
export const getPendingTrack = () => {
  const pendingTrackStr = localStorage.getItem('spotify_pending_track');
  if (pendingTrackStr) {
    localStorage.removeItem('spotify_pending_track');
    try {
      return JSON.parse(pendingTrackStr);
    } catch (e) {
      console.error('Failed to parse pending track:', e);
      return null;
    }
  }
  return null;
};

// Exchange authorization code for access token using PKCE
export const handleSpotifyCallback = async (code: string): Promise<boolean> => {
  setSpotifyAuthLoading(true);

  try {
    // Get the code verifier from localStorage
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.error('Code verifier not found - auth flow was interrupted');
      throw new Error('Code verifier not found');
    }

    const tokenParams = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      code_verifier: codeVerifier
    };

    const response = await fetch(`${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error} - ${errorData.error_description}`);
    }

    const data = await response.json();

    // Store tokens
    setSpotifyAccessToken(data.access_token);
    localStorage.setItem('spotify_access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }

    // Get user info
    await fetchSpotifyUser(data.access_token);

    setIsSpotifyAuthenticated(true);
    localStorage.removeItem('spotify_auth_initiated');
    localStorage.removeItem('spotify_code_verifier');

    // Load Spotify SDK now that we're authenticated
    if (window.loadSpotifySDK) {
      window.loadSpotifySDK().catch(console.error);
    }

    return true;
  } catch (error) {
    console.error('Spotify auth error:', error);
    // Clean up on error
    localStorage.removeItem('spotify_auth_initiated');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_pending_track');
    return false;
  } finally {
    setSpotifyAuthLoading(false);
  }
};

// Fetch Spotify user information
const fetchSpotifyUser = async (token: string) => {
  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      setSpotifyUser(user);
      console.log('Spotify user:', user);
    }
  } catch (error) {
    console.error('Failed to fetch Spotify user:', error);
  }
};

// Validate existing token
const validateSpotifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const disconnectSpotify = () => {
  setIsSpotifyAuthenticated(false);
  setSpotifyAccessToken(null);
  setSpotifyUser(null);
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
};

// Initialize auth state from localStorage on app start
export const initializeAuth = async () => {
  const savedToken = localStorage.getItem('spotify_access_token');
  if (savedToken) {
    const isValid = await validateSpotifyToken(savedToken);
    if (isValid) {
      setSpotifyAccessToken(savedToken);
      setIsSpotifyAuthenticated(true);
      await fetchSpotifyUser(savedToken);
    } else {
      // Token is invalid, clear it
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
    }
  }
};