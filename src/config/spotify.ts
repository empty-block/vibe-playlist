// Spotify Web API configuration
export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your-spotify-client-id',
  // Ensure redirect URI doesn't have trailing slash and matches exactly what's in Spotify dashboard
  REDIRECT_URI: (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback').replace(/\/$/, ''),
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

// Generate Spotify authorization URL using PKCE flow
export const getSpotifyAuthURL = async (): Promise<string> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store verifier for token exchange (use localStorage to persist across redirect)
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  console.log('Spotify Config:', {
    CLIENT_ID: SPOTIFY_CONFIG.CLIENT_ID,
    REDIRECT_URI: SPOTIFY_CONFIG.REDIRECT_URI,
    SCOPES: SPOTIFY_CONFIG.SCOPES
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CONFIG.CLIENT_ID,
    scope: SPOTIFY_CONFIG.SCOPES,
    redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
    state: generateRandomString(16),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  const authURL = `${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/authorize?${params.toString()}`;
  console.log('Generated auth URL:', authURL);
  console.log('Code verifier stored:', codeVerifier);
  console.log('Redirect URI:', SPOTIFY_CONFIG.REDIRECT_URI);
  
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