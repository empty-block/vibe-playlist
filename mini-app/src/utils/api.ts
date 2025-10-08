/**
 * API client for Jamzy backend
 */

export interface ApiActivityUser {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl?: string;
}

export interface ApiMusicTrack {
  id: string;
  title: string;
  artist: string;
  platform: string;
  platformId: string;
  url: string;
  thumbnail?: string;
}

export interface ApiCast {
  castHash: string;
  text: string;
  author: ApiActivityUser;
  timestamp: string;
  music: ApiMusicTrack[];
  stats: {
    replies: number;
    likes: number;
    recasts: number;
  };
}

export interface ApiActivity {
  type: 'AUTHORED' | 'LIKED' | 'RECASTED';
  user: ApiActivityUser;
  cast: ApiCast;
  timestamp: string;
}

export interface ApiActivityResponse {
  activity: ApiActivity[];
  nextCursor?: string;
}

/**
 * Get the API base URL from environment
 */
export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:4201';
}

/**
 * Fetch global activity feed from backend
 */
export async function fetchActivity(cursor?: string): Promise<ApiActivityResponse> {
  const url = new URL(`${getApiUrl()}/api/activity`);

  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }

  url.searchParams.set('limit', '50');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch activity: ${response.statusText}`);
  }

  return response.json();
}
