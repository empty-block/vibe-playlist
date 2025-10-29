import { spotifyAccessToken } from '../stores/authStore';
import { SPOTIFY_CONFIG } from '../config/spotify';

/**
 * Spotify Connect API service for controlling playback on external devices
 * This is used in Farcaster mini-app where Web Playback SDK doesn't work
 */

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    duration_ms: number;
    album: {
      images: Array<{ url: string }>;
    };
  } | null;
  device: {
    id: string;
    name: string;
    type: string;
  } | null;
}

/**
 * Start playback of a track on the user's active Spotify device
 */
export const playTrackOnConnect = async (trackId: string): Promise<boolean> => {
  const token = spotifyAccessToken();
  console.log('playTrackOnConnect - token check:', token ? `has token (${token.substring(0, 20)}...)` : 'NO TOKEN!');

  if (!token) {
    console.error('No Spotify access token available');
    console.error('spotifyAccessToken() returned:', token);
    return false;
  }

  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/play`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
      }),
    });

    if (response.status === 204) {
      // Success - no content returned
      return true;
    }

    if (response.status === 404) {
      console.error('No active Spotify device found - user needs to open Spotify app/web player');
      return false;
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Spotify Connect forbidden:', errorData);
      // Check if it's a device issue
      if (errorData.error?.reason === 'NO_ACTIVE_DEVICE') {
        console.error('No active device - user must open Spotify first');
      }
      return false;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Spotify Connect play error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error playing track on Spotify Connect:', error);
    return false;
  }
};

/**
 * Toggle play/pause on the user's active Spotify device
 */
export const togglePlaybackOnConnect = async (shouldPlay: boolean): Promise<boolean> => {
  const token = spotifyAccessToken();
  console.log('togglePlaybackOnConnect - token check:', token ? `has token (${token.substring(0, 20)}...)` : 'NO TOKEN!');

  if (!token) {
    console.error('No access token available');
    console.error('spotifyAccessToken() returned:', token);
    return false;
  }

  try {
    const endpoint = shouldPlay ? 'play' : 'pause';
    console.log(`Attempting to ${endpoint} via Spotify Connect API`);

    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      console.log(`Successfully ${endpoint}ed playback`);
      return true;
    }

    if (response.status === 404) {
      console.error('No active device found');
      return false;
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Forbidden error when trying to ${endpoint}:`, errorData);
      return false;
    }

    // Log any other errors
    const errorData = await response.json().catch(() => ({}));
    console.error(`Failed to ${endpoint} (status ${response.status}):`, errorData);
    return false;
  } catch (error) {
    console.error('Error toggling Spotify playback:', error);
    return false;
  }
};

/**
 * Skip to next track on the user's active Spotify device
 */
export const skipToNextOnConnect = async (): Promise<boolean> => {
  const token = spotifyAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/next`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.status === 204;
  } catch (error) {
    console.error('Error skipping to next track:', error);
    return false;
  }
};

/**
 * Skip to previous track on the user's active Spotify device
 */
export const skipToPreviousOnConnect = async (): Promise<boolean> => {
  const token = spotifyAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/previous`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.status === 204;
  } catch (error) {
    console.error('Error skipping to previous track:', error);
    return false;
  }
};

/**
 * Seek to a specific position on the user's active Spotify device
 */
export const seekOnConnect = async (positionMs: number): Promise<boolean> => {
  const token = spotifyAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `${SPOTIFY_CONFIG.API_BASE_URL}/me/player/seek?position_ms=${Math.floor(positionMs)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.status === 204;
  } catch (error) {
    console.error('Error seeking:', error);
    return false;
  }
};

/**
 * Get current playback state from Spotify
 * This is used for polling to update the UI
 */
export const getPlaybackState = async (): Promise<SpotifyPlaybackState | null> => {
  const token = spotifyAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      // No content - no active playback
      return null;
    }

    if (!response.ok) {
      console.error('Failed to get playback state:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting playback state:', error);
    return null;
  }
};

/**
 * Get available Spotify devices
 */
export const getAvailableDevices = async (): Promise<any[]> => {
  const token = spotifyAccessToken();
  if (!token) return [];

  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/devices`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get devices:', response.status);
      return [];
    }

    const data = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error('Error getting devices:', error);
    return [];
  }
};

/**
 * Wait for an active Spotify device to appear
 * Polls the devices endpoint until an active device is found or timeout
 */
export const waitForActiveDevice = async (
  maxAttempts: number = 10,
  intervalMs: number = 2000
): Promise<{ success: boolean; deviceName?: string }> => {
  console.log('Waiting for active Spotify device...');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const devices = await getAvailableDevices();
    const activeDevice = devices.find((d: any) => d.is_active);

    if (activeDevice) {
      console.log(`Active device found: ${activeDevice.name} (${activeDevice.type})`);
      return { success: true, deviceName: activeDevice.name };
    }

    console.log(`Attempt ${attempt + 1}/${maxAttempts}: No active device yet...`);

    // Wait before next attempt (unless this is the last attempt)
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log('No active device found after timeout');
  return { success: false };
};
