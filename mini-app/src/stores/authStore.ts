import { createSignal, createEffect } from 'solid-js';
import { getSpotifyAuthURL, SPOTIFY_CONFIG } from '../config/spotify';
import { farcasterAuth } from './farcasterStore';
import sdk from '@farcaster/miniapp-sdk';

// Current user state - now derived from Farcaster auth
export const [currentUser, setCurrentUser] = createSignal<{
  fid: string;
  username: string;
  avatar: string | null;
  displayName: string;
} | null>(null);

// General authentication state - derived from Farcaster
export const [isAuthenticated, setIsAuthenticated] = createSignal(false);

// Sync currentUser with Farcaster auth state
createEffect(() => {
  const auth = farcasterAuth();

  if (auth.isAuthenticated && auth.fid) {
    setCurrentUser({
      fid: auth.fid,
      username: auth.username || 'Unknown',
      avatar: auth.pfpUrl,
      displayName: auth.displayName || auth.username || 'User',
    });
    setIsAuthenticated(true);
  } else {
    // For local development without Farcaster context, use mock data
    setCurrentUser({
      fid: '326181',
      username: 'hendrix_69',
      avatar: 'https://cdn-p.smehost.net/sites/7072b26066004910853871410c44e9f1/wp-content/uploads/2017/12/171207_hendrix-bsots_525px.jpg',
      displayName: 'Jimi (Dev Mode)'
    });
    setIsAuthenticated(true);
  }
});

// Spotify authentication state
export const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = createSignal(false);

// Wrap setSpotifyAccessToken to add logging
const [_spotifyAccessToken, _setSpotifyAccessToken] = createSignal<string | null>(null);
export const spotifyAccessToken = _spotifyAccessToken;
export const setSpotifyAccessToken = (token: string | null) => {
  console.log('setSpotifyAccessToken called with:', token ? `token (${token.substring(0, 20)}...)` : 'null');
  console.trace('Token setter call stack');
  _setSpotifyAccessToken(token);
};

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
export const initiateSpotifyAuth = async () => {
  // Clean up any stale auth data before starting new auth flow
  localStorage.removeItem('spotify_auth_initiated');
  localStorage.removeItem('spotify_code_verifier');

  const authURL = await getSpotifyAuthURL();

  // Store the current state to handle redirect
  localStorage.setItem('spotify_auth_initiated', 'true');

  // Open in popup window for iframe compatibility
  // Popup will send auth code back via postMessage
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const popup = window.open(
    authURL,
    'spotify-auth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    console.error('Failed to open popup - may be blocked');
    // Fallback to redirect if popup is blocked
    window.location.href = authURL;
  }
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