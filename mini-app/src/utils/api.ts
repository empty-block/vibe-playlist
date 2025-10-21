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

/**
 * Trending API types
 */
export interface ApiTrendingTrack {
  rank: number;
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  shares: number;
  uniqueLikes?: number;
  uniqueReplies?: number;
  score?: number;
}

export interface ApiTrendingContributor {
  rank: number;
  fid: string;
  username: string;
  displayName: string;
  avatar: string;
  trackCount: number;
  uniqueEngagers: number;
  score?: number;
}

export interface ApiTrendingTracksResponse {
  tracks: ApiTrendingTrack[];
  updatedAt: string;
  cached?: boolean;
}

export interface ApiTrendingUsersResponse {
  contributors: ApiTrendingContributor[];
  updatedAt: string;
  cached?: boolean;
}

/**
 * Fetch trending tracks from backend
 */
export async function fetchTrendingTracks(limit: number = 10): Promise<ApiTrendingTracksResponse> {
  const url = new URL(`${getApiUrl()}/api/music/trending`);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('timeframe', '7d');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch trending tracks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch trending users/contributors from backend
 */
export async function fetchTrendingUsers(limit: number = 10): Promise<ApiTrendingUsersResponse> {
  const url = new URL(`${getApiUrl()}/api/trending/users`);
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch trending users: ${response.statusText}`);
  }

  return response.json();
}

/**
 * User Profile API types
 */
export interface ApiUserProfile {
  user: {
    fid: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  stats: {
    tracksShared: number;
    tracksLiked: number;
    tracksReplied: number;
    tracksRecasted: number;
  };
}

export interface ApiUserThread {
  castHash: string;
  text: string;
  author: {
    fid: string;
    username: string;
    displayName: string;
    pfpUrl?: string;
  };
  timestamp: string;
  music: Array<{
    id: string;
    title: string;
    artist: string;
    platform: string;
    platformId: string;
    url: string;
    thumbnail?: string;
  }>;
  stats: {
    replies: number;
    likes: number;
    recasts: number;
  };
}

export interface ApiUserThreadsResponse {
  threads: ApiUserThread[];
  nextCursor?: string;
}

/**
 * Fetch user profile with activity stats
 */
export async function fetchUserProfile(fid: string): Promise<ApiUserProfile> {
  const url = new URL(`${getApiUrl()}/api/users/${fid}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch user threads with pagination
 */
export async function fetchUserThreads(fid: string, cursor?: string, limit: number = 50): Promise<ApiUserThreadsResponse> {
  const url = new URL(`${getApiUrl()}/api/users/${fid}/threads`);

  url.searchParams.set('limit', limit.toString());
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch user threads: ${response.statusText}`);
  }

  return response.json();
}
