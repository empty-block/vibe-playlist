// Spotify Web API configuration

// Dynamically determine redirect URI based on current domain
// This allows the app to work across dev/staging/prod without config changes
const getRedirectURI = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '';
  }

  const origin = window.location.origin;
  const allowedDomains = [
    'https://jamzy.fun',
    'https://dev.jamzy-miniapp.pages.dev',
    'https://jamzy-miniapp.pages.dev',
    'http://localhost:3002', // Local dev
    'http://127.0.0.1:3002'  // Local dev (alternate)
  ];

  // Use current origin if it's in the allowedDomains, otherwise fall back to env variable
  return allowedDomains.includes(origin) ? origin : import.meta.env.VITE_SPOTIFY_REDIRECT_URI || origin;
};

export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  REDIRECT_URI: getRedirectURI(),
  SCOPES: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ].join(' '),
  API_BASE_URL: 'https://api.spotify.com/v1',
  ACCOUNTS_BASE_URL: 'https://accounts.spotify.com'
};

// PKCE challenge generation
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Generate code verifier for PKCE
export const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Generate Spotify authorization URL using PKCE flow (recommended for browser apps)
export const getSpotifyAuthURL = async (pendingTrackData?: any): Promise<string> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store verifier for token exchange
  localStorage.setItem('spotify_code_verifier', codeVerifier);

  // Build state parameter: include CSRF token + optional pending track data
  const stateData = {
    csrf: generateRandomString(16),
    ...(pendingTrackData && { pendingTrack: pendingTrackData })
  };
  const stateParam = btoa(JSON.stringify(stateData));

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CONFIG.CLIENT_ID,
    scope: SPOTIFY_CONFIG.SCOPES,
    redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
    state: stateParam,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  const authURL = `${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/authorize?${params.toString()}`;

  return authURL;
};

// Generate random string for state parameter
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};