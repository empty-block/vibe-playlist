import { createSignal, createEffect } from 'solid-js';
import sdk from '@farcaster/miniapp-sdk';

// Farcaster authentication state
export const [farcasterAuth, setFarcasterAuth] = createSignal<{
  isAuthenticated: boolean;
  fid: string | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  token: string | null;
}>({
  isAuthenticated: false,
  fid: null,
  username: null,
  displayName: null,
  pfpUrl: null,
  token: null,
});

export const [farcasterLoading, setFarcasterLoading] = createSignal(false);
export const [farcasterError, setFarcasterError] = createSignal<string | null>(null);

// Cache the Mini App detection result - SDK caches internally too
let cachedMiniAppStatus: boolean | null = null;

/**
 * Check if we're running in a Farcaster context
 * Uses the official SDK method: sdk.isInMiniApp()
 * The SDK caches the result internally after first check
 */
const isInFarcasterContext = async (): Promise<boolean> => {
  // Return cached result if available
  if (cachedMiniAppStatus !== null) {
    return cachedMiniAppStatus;
  }

  try {
    // Use official SDK detection (100ms timeout by default)
    const isMiniApp = await sdk.isInMiniApp();
    console.log('[Farcaster Detection] isInMiniApp:', isMiniApp);
    cachedMiniAppStatus = isMiniApp;
    return isMiniApp;
  } catch (error) {
    console.log('[Farcaster Detection] Check failed:', error);
    cachedMiniAppStatus = false;
    return false;
  }
};

/**
 * Synchronous check for Farcaster context (uses cached value)
 * IMPORTANT: Returns null if check hasn't completed yet
 */
export const isInFarcasterSync = (): boolean | null => {
  return cachedMiniAppStatus;
};

/**
 * Initialize Farcaster authentication
 * This will get the auth token and extract user info from the context
 */
export const initializeFarcaster = async () => {
  setFarcasterLoading(true);
  setFarcasterError(null);

  try {
    // Check if we're in a Farcaster context using the SDK's official method
    const isInMiniApp = await isInFarcasterContext();

    if (!isInMiniApp) {
      console.log('Not in Farcaster Mini App - running in standalone mode');
      // For local development, we can still work without Farcaster context
      setFarcasterAuth({
        isAuthenticated: false,
        fid: null,
        username: null,
        displayName: null,
        pfpUrl: null,
        token: null,
      });
      setFarcasterLoading(false);
      return;
    }

    console.log('Farcaster Mini App context detected!');

    // Get the authentication token using Quick Auth
    const token = await sdk.quickAuth.getToken();
    console.log('Got Quick Auth token:', token ? 'Yes' : 'No');

    // Extract FID from context - MUST await the context Promise AND each property!
    const context = await sdk.context;
    console.log('Awaited context:', context);
    console.log('Context user:', context?.user);

    // Each property is ALSO a Promise/async getter - must await individually
    let fid: string | null = null;
    let username: string | null = null;
    let displayName: string | null = null;
    let pfpUrl: string | null = null;

    try {
      const fidValue = await context?.user?.fid;
      fid = fidValue != null ? String(fidValue) : null;
      console.log('Got fid:', fid);
    } catch (err) {
      console.error('Error getting fid:', err);
    }

    try {
      const usernameValue = await context?.user?.username;
      username = usernameValue != null ? String(usernameValue) : null;
      console.log('Got username:', username);
    } catch (err) {
      console.error('Error getting username:', err);
    }

    try {
      const displayNameValue = await context?.user?.displayName;
      displayName = displayNameValue != null ? String(displayNameValue) : null;
      console.log('Got displayName:', displayName);
    } catch (err) {
      console.error('Error getting displayName:', err);
    }

    try {
      const pfpUrlValue = await context?.user?.pfpUrl;
      pfpUrl = pfpUrlValue != null ? String(pfpUrlValue) : null;
      console.log('Got pfpUrl:', pfpUrl ? 'Yes' : 'No');
    } catch (err) {
      console.error('Error getting pfpUrl:', err);
    }

    console.log('Extracted Farcaster user info:', {
      fid,
      username,
      displayName,
      pfpUrl: pfpUrl ? 'Yes' : 'No',
      types: {
        fid: typeof fid,
        username: typeof username,
        displayName: typeof displayName,
      }
    });

    setFarcasterAuth({
      isAuthenticated: true,
      fid,
      username,
      displayName,
      pfpUrl,
      token,
    });

    // Store token in localStorage for API calls
    if (token) {
      localStorage.setItem('farcaster_token', token);
    }
  } catch (error) {
    console.log('Not in Farcaster context (caught error):', error);

    // Set to unauthenticated state - this is normal for local dev
    setFarcasterAuth({
      isAuthenticated: false,
      fid: null,
      username: null,
      displayName: null,
      pfpUrl: null,
      token: null,
    });
  } finally {
    setFarcasterLoading(false);
  }
};

/**
 * Refresh the auth token
 * Useful when the token expires or needs to be refreshed
 */
export const refreshFarcasterToken = async (): Promise<string | null> => {
  try {
    const isInMiniApp = await isInFarcasterContext();
    if (!isInMiniApp) {
      console.log('Not in Farcaster context - cannot refresh token');
      return null;
    }

    const token = await sdk.quickAuth.getToken();

    if (token) {
      localStorage.setItem('farcaster_token', token);
      setFarcasterAuth(prev => ({ ...prev, token }));
    }

    return token;
  } catch (error) {
    console.log('Failed to refresh Farcaster token (not in Farcaster):', error);
    return null;
  }
};

/**
 * Make an authenticated fetch request using Quick Auth
 * This automatically includes the Bearer token in the Authorization header
 *
 * IMPORTANT: For now, we're using regular fetch even in Farcaster context
 * because sdk.quickAuth.fetch() may have CORS/proxy issues in the WebView.
 * We'll add auth headers manually when backend auth is needed.
 */
export const farcasterFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  try {
    // For now, always use regular fetch to avoid SDK fetch issues
    // The API endpoints don't require auth yet
    return fetch(url, options);

    /* TODO: Re-enable when backend auth is implemented
    // Check if we're in a Farcaster context (cached check)
    const isInMiniApp = await isInFarcasterContext();

    // If we're not in a Farcaster context, use regular fetch
    if (!isInMiniApp) {
      return fetch(url, options);
    }

    // Get token and add to headers manually (more reliable than SDK fetch)
    const token = await sdk.quickAuth.getToken();
    if (token) {
      const headers = new Headers(options?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      return fetch(url, { ...options, headers });
    }

    // No token, use regular fetch
    return fetch(url, options);
    */
  } catch (error) {
    // If anything fails, fall back to regular fetch
    console.log('farcasterFetch error, using regular fetch:', error);
    return fetch(url, options);
  }
};

/**
 * Sign out from Farcaster (clear local state)
 */
export const signOutFarcaster = () => {
  setFarcasterAuth({
    isAuthenticated: false,
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null,
    token: null,
  });
  localStorage.removeItem('farcaster_token');
};

// Auto-initialize when the store is imported
// This MUST complete before tracks can be played
if (typeof window !== 'undefined') {
  // Initialize immediately - SDK detection is fast (100ms default timeout)
  initializeFarcaster().catch(() => {
    console.log('[Farcaster] Initialization skipped (not in Farcaster context)');
  });
}
