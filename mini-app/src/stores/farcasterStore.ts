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

/**
 * Check if we're running in a Farcaster context
 * Uses the official SDK method to detect Mini App environment
 */
const isInFarcasterContext = async (): Promise<boolean> => {
  try {
    // Use the official SDK method to check if we're in a Mini App
    const isMiniApp = await sdk.isInMiniApp();
    console.log('SDK isInMiniApp check:', isMiniApp);
    return isMiniApp;
  } catch (error) {
    // If the check fails, we're not in Farcaster
    console.log('isInMiniApp check failed:', error);
    return false;
  }
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
    console.log('SDK context:', sdk.context);

    // Get the authentication token using Quick Auth
    const token = await sdk.quickAuth.getToken();
    console.log('Got Quick Auth token:', token ? 'Yes' : 'No');

    // Extract FID from context
    const fid = sdk.context?.user?.fid?.toString() || null;
    const username = sdk.context?.user?.username || null;
    const displayName = sdk.context?.user?.displayName || null;
    const pfpUrl = sdk.context?.user?.pfpUrl || null;

    console.log('Farcaster user info:', {
      fid,
      username,
      displayName,
      pfpUrl: pfpUrl ? 'Yes' : 'No',
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
 */
export const farcasterFetch = async (
  url: string,
  options?: RequestInit
): Promise<Response> => {
  try {
    // Check if we're in a Farcaster context
    const isInMiniApp = await isInFarcasterContext();

    // If we're not in a Farcaster context, fall back to regular fetch
    if (!isInMiniApp) {
      return fetch(url, options);
    }

    // Use Quick Auth fetch which automatically adds the token
    return await sdk.quickAuth.fetch(url, options);
  } catch (error) {
    // If Quick Auth fails, fall back to regular fetch
    console.log('Using regular fetch (not in Farcaster context)');
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
// This will be called after the SDK is ready
if (typeof window !== 'undefined') {
  // Wait a bit for SDK to initialize, then try to init Farcaster
  // This will gracefully fail if not in Farcaster context
  setTimeout(() => {
    initializeFarcaster().catch(() => {
      // Silently handle initialization failure for non-Farcaster environments
      console.log('Farcaster initialization skipped (not in Farcaster context)');
    });
  }, 100);
}
